"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { flash } from "@/lib/flash";
import { assertCan } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { parseForm, workspaceName } from "@/lib/validation";

export async function renameWorkspaceAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "workspace:update");
    const { name } = parseForm(form, { name: workspaceName });
    await auth.api.updateOrganization({ body: { data: { name }, organizationId: ctx.workspace.id }, headers: await headers() });
    revalidatePath("/", "layout");
    return { ok: "Workspace renamed" };
  });
}

export async function deleteWorkspaceAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "workspace:delete");
    if (String(form.get("confirm") ?? "").trim() !== ctx.workspace.name) {
      return { fieldErrors: { confirm: `Type ${ctx.workspace.name} exactly to confirm.` } };
    }
    await auth.api.deleteOrganization({ body: { organizationId: ctx.workspace.id }, headers: await headers() });
    revalidatePath("/", "layout");
    await flash(`Deleted ${ctx.workspace.name}`);
    redirect("/dashboard");
  });
}

export async function leaveWorkspaceAction(): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    await auth.api.leaveOrganization({ body: { organizationId: ctx.workspace.id }, headers: await headers() });
    revalidatePath("/", "layout");
    await flash(`You left ${ctx.workspace.name}`);
    redirect("/dashboard");
  });
}
