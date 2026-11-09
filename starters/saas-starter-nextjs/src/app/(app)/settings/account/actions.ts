"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { emailEnabled } from "@/lib/config";
import { flash } from "@/lib/flash";
import { email, newPassword, parseForm, personName } from "@/lib/validation";

export async function updateNameAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { name } = parseForm(form, { name: personName });
    await auth.api.updateUser({ body: { name }, headers: await headers() });
    revalidatePath("/", "layout");
    return { ok: "Name saved" };
  });
}

export async function changeEmailAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const { email: newEmail } = parseForm(form, { email });
    await auth.api.changeEmail({ body: { newEmail, callbackURL: "/settings/account" }, headers: await headers() });
    revalidatePath("/", "layout");
    return { ok: emailEnabled ? "Check your inbox to confirm the new address" : "Email updated" };
  });
}

export async function changePasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const body = parseForm(form, { currentPassword: z.string().min(1, "Enter your current password"), newPassword });
    try {
      await auth.api.changePassword({ body: { ...body, revokeOtherSessions: true }, headers: await headers() });
    } catch (err) {
      // Better Auth answers INVALID_PASSWORD for a wrong current password; show it on that field.
      if ((err as { body?: { code?: string } }).body?.code === "INVALID_PASSWORD") {
        return { fieldErrors: { currentPassword: "That is not your current password." } };
      }
      throw err;
    }
    return { ok: "Password changed. Other devices were signed out." };
  });
}

export async function deleteAccountAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const password = String(form.get("password") ?? "");
    if (form.get("hasPassword") === "1" && !password) return { fieldErrors: { password: "Enter your password to confirm." } };
    await auth.api.deleteUser({ body: password ? { password } : {}, headers: await headers() });
    await flash("Your account was deleted");
    redirect("/");
  });
}
