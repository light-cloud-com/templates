"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";

// Better Auth's admin plugin checks that the caller has the admin role on each of these.
export async function setBannedAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const userId = String(form.get("userId"));
    const h = await headers();
    if (form.get("ban") === "1") {
      await auth.api.banUser({ body: { userId, banReason: "Disabled by an admin" }, headers: h });
    } else {
      await auth.api.unbanUser({ body: { userId }, headers: h });
    }
    revalidatePath("/admin");
    return { ok: form.get("ban") === "1" ? "User disabled and signed out" : "User enabled" };
  });
}

export async function impersonateAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    await auth.api.impersonateUser({ body: { userId: String(form.get("userId")) }, headers: await headers() });
    revalidatePath("/", "layout");
    redirect("/dashboard");
  });
}
