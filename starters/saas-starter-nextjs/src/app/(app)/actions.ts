"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { flash } from "@/lib/flash";
import { requireUser } from "@/lib/session";
import { safeNext } from "@/lib/url";
import { parseForm, workspaceName } from "@/lib/validation";

/** Switches workspace and stays in the same section (a project page goes back to the list). */
export async function switchWorkspaceAction(organizationId: string, pathname: string) {
  // Better Auth refuses workspaces the user is not a member of.
  await auth.api.setActiveOrganization({ body: { organizationId }, headers: await headers() });
  revalidatePath("/", "layout");
  const section = safeNext(pathname).replace(/^\/projects\/.+$/, "/projects");
  redirect(section.startsWith("/workspaces") ? "/dashboard" : section);
}

export async function createWorkspaceAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    await requireUser();
    const { name } = parseForm(form, { name: workspaceName });
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workspace"}-${randomBytes(3).toString("hex")}`;
    // Creating a workspace also makes it the active one.
    await auth.api.createOrganization({ body: { name, slug }, headers: await headers() });
    // The sidebar (switcher and its list) lives in the layout, so refresh it too.
    revalidatePath("/", "layout");
    await flash(`Created ${name}`);
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
  revalidatePath("/", "layout");
  redirect("/admin");
}
