"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { emailEnabled } from "@/lib/config";

export async function updateNameAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const name = z.string().trim().min(1, "Enter your name").max(100).parse(form.get("name"));
    await auth.api.updateUser({ body: { name }, headers: await headers() });
    revalidatePath("/", "layout");
    return { ok: "Name saved." };
  });
}

export async function changeEmailAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const newEmail = z.email("Enter a valid email address").parse(form.get("email"));
    await auth.api.changeEmail({ body: { newEmail, callbackURL: "/settings/account" }, headers: await headers() });
    revalidatePath("/", "layout");
    return { ok: emailEnabled ? "Check your inbox to confirm the change." : "Email updated." };
  });
}

export async function changePasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const body = z
      .object({ currentPassword: z.string().min(1, "Enter your current password"), newPassword: z.string().min(8, "Use at least 8 characters").max(128) })
      .parse(Object.fromEntries(form));
    await auth.api.changePassword({ body: { ...body, revokeOtherSessions: true }, headers: await headers() });
    return { ok: "Password changed. Other devices were signed out." };
  });
}

export async function deleteAccountAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const password = String(form.get("password") ?? "");
    await auth.api.deleteUser({ body: password ? { password } : {}, headers: await headers() });
    redirect("/");
  });
}
