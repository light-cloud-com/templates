"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionState, RateLimitedError, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { emailEnabled } from "@/lib/config";
import { allow, clientIp } from "@/lib/rate-limit";
import { safeNext } from "@/lib/url";

const email = z.email("Enter a valid email address").transform((e) => e.toLowerCase());
const password = z.string().min(8, "Use at least 8 characters").max(128);

// Per IP: 5 sign-ins or sign-ups a minute, 3 reset emails per 10 minutes, 5 password resets a minute.
const limits = { signIn: [5, 60_000], signUp: [5, 60_000], resetEmail: [3, 600_000], reset: [5, 60_000] } as const;

async function throttle(action: keyof typeof limits) {
  const [max, windowMs] = limits[action];
  if (!allow(`${action}:${clientIp(await headers())}`, max, windowMs)) {
    throw new RateLimitedError();
  }
}

export async function signUpAction(_: ActionState, form: FormData): Promise<ActionState> {
  const next = safeNext(form.get("next"), "/onboarding");
  return runAction(async () => {
    await throttle("signUp");
    const body = z
      .object({ name: z.string().trim().min(1, "Enter your name").max(100), email, password })
      .parse(Object.fromEntries(form));
    await auth.api.signUpEmail({ body: { ...body, callbackURL: next }, headers: await headers() });
    if (emailEnabled) return { ok: `We sent a confirmation link to ${body.email}. Open it to finish signing up.` };
    redirect(next);
  });
}

export async function signInAction(_: ActionState, form: FormData): Promise<ActionState> {
  const next = safeNext(form.get("next"));
  return runAction(async () => {
    await throttle("signIn");
    const body = z.object({ email, password: z.string().min(1, "Enter your password") }).parse(Object.fromEntries(form));
    await auth.api.signInEmail({ body: { ...body, callbackURL: next }, headers: await headers() });
    redirect(next);
  });
}

export async function socialSignInAction(form: FormData) {
  const provider = z.enum(["github", "google"]).parse(form.get("provider"));
  const { url } = await auth.api.signInSocial({
    body: { provider, callbackURL: safeNext(form.get("next")), newUserCallbackURL: "/onboarding" },
    headers: await headers(),
  });
  if (url) redirect(url);
}

export async function forgotPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    await throttle("resetEmail");
    await auth.api.requestPasswordReset({
      body: { email: email.parse(form.get("email")), redirectTo: "/reset-password" },
      headers: await headers(),
    });
    return {
      ok: emailEnabled
        ? "If that email has an account, a reset link is on its way."
        : "No email provider is set up, so the reset link was written to the server logs.",
    };
  });
}

export async function resetPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    await throttle("reset");
    const body = z.object({ token: z.string().min(1), newPassword: password }).parse(Object.fromEntries(form));
    await auth.api.resetPassword({ body, headers: await headers() });
    redirect("/sign-in?reset=1");
  });
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function acceptInviteAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const invitationId = z.string().min(1).parse(form.get("invitationId"));
    const h = await headers();
    const result = await auth.api.acceptInvitation({ body: { invitationId }, headers: h });
    await auth.api.setActiveOrganization({ body: { organizationId: result?.invitation.organizationId }, headers: h });
    redirect("/dashboard");
  });
}

export async function declineInviteAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const invitationId = z.string().min(1).parse(form.get("invitationId"));
    await auth.api.rejectInvitation({ body: { invitationId }, headers: await headers() });
    redirect("/dashboard");
  });
}
