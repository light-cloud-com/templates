"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { safeNext } from "@/lib/url";

export async function switchWorkspaceAction(organizationId: string) {
  // Better Auth refuses workspaces the user is not a member of.
  await auth.api.setActiveOrganization({ body: { organizationId }, headers: await headers() });
  redirect("/dashboard");
}

export async function createWorkspaceAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    await requireUser();
    const name = z.string().trim().min(1, "Name your workspace").max(80).parse(form.get("name"));
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workspace"}-${randomBytes(3).toString("hex")}`;
    // Creating a workspace also makes it the active one.
    await auth.api.createOrganization({ body: { name, slug }, headers: await headers() });
    redirect(safeNext(form.get("next")));
  });
}

export async function completeOnboardingAction() {
  const { user } = await requireUser();
  await db.update(schema.user).set({ onboardingCompleted: true }).where(eq(schema.user.id, user.id));
  redirect("/dashboard");
}

export async function stopImpersonatingAction() {
  await auth.api.stopImpersonating({ headers: await headers() });
  redirect("/admin");
}
