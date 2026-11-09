"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";

export async function renameWorkspaceAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "workspace:update");
    const name = z.string().trim().min(1, "Name your workspace").max(80).parse(form.get("name"));
    await auth.api.updateOrganization({ body: { data: { name }, organizationId: ctx.workspace.id }, headers: await headers() });
    revalidatePath("/", "layout");
    return { ok: "Workspace renamed." };
  });
}

export async function deleteWorkspaceAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "workspace:delete");
    if (form.get("confirm") !== ctx.workspace.name) return { error: `Type ${ctx.workspace.name} to confirm.` };
    await auth.api.deleteOrganization({ body: { organizationId: ctx.workspace.id }, headers: await headers() });
    redirect("/dashboard");
  });
}

export async function leaveWorkspaceAction(): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    await auth.api.leaveOrganization({ body: { organizationId: ctx.workspace.id }, headers: await headers() });
    redirect("/dashboard");
  });
}
