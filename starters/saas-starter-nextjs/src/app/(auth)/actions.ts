"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionState, RateLimitedError, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { emailEnabled } from "@/lib/config";
import { allow, clientIp } from "@/lib/rate-limit";
import { safeNext } from "@/lib/url";
import { email, newPassword, parseForm, personName } from "@/lib/validation";

// Per IP: 10 sign-ins or sign-ups a minute, 3 reset emails per 10 minutes, 10 password resets a minute.
// Only well-formed submissions count, so typos still get their field errors and do not use up tries.
const throttles = { signIn: [10, 60_000], signUp: [10, 60_000], resetEmail: [3, 600_000], reset: [10, 60_000] } as const;

async function throttle(action: keyof typeof throttles) {
  const [max, windowMs] = throttles[action];
  if (!allow(`${action}:${clientIp(await headers())}`, max, windowMs)) {
    throw new RateLimitedError();
  }
}

export async function signUpAction(_: ActionState, form: FormData): Promise<ActionState> {
  const next = safeNext(form.get("next"), "/onboarding");
  return runAction(async () => {
    const body = parseForm(form, { name: personName, email, password: newPassword });
    await throttle("signUp");
    await auth.api.signUpEmail({ body: { ...body, callbackURL: next }, headers: await headers() });
    if (emailEnabled) return { ok: `We sent a confirmation link to ${body.email}. Open it to finish signing up.` };
    redirect(next);
  });
}

export async function signInAction(_: ActionState, form: FormData): Promise<ActionState> {
  const next = safeNext(form.get("next"));
  return runAction(async () => {
    const body = parseForm(form, { email, password: z.string().min(1, "Enter your password") });
    await throttle("signIn");
    await auth.api.signInEmail({ body: { ...body, callbackURL: next }, headers: await headers() });
    redirect(next);
  });
}

export async function socialSignInAction(form: FormData) {
  const provider = z.enum(["github", "google"]).parse(form.get("provider"));
  const { url } = await auth.api.signInSocial({
    body: { provider, callbackURL: safeNext(form.get("next")), newUserCallbackURL: safeNext(form.get("next"), "/onboarding") },
    headers: await headers(),
  });
  if (url) redirect(url);
}

export async function forgotPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const body = parseForm(form, { email });
    await throttle("resetEmail");
    await auth.api.requestPasswordReset({ body: { email: body.email, redirectTo: "/reset-password" }, headers: await headers() });
    return { ok: `If ${body.email} has an account, a reset link is on its way. Check your email.` };
  });
}

export async function resetPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const token = z.string().min(1, "This link is incomplete. Ask for a new one.").parse(form.get("token") ?? "");
    const body = parseForm(form, { newPassword });
    await throttle("reset");
    await auth.api.resetPassword({ body: { token, ...body }, headers: await headers() });
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
