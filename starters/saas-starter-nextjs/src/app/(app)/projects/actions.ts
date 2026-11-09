"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, runAction } from "@/lib/action";
import { assertCan } from "@/lib/permissions";
import { createProject, deleteProject, updateProject } from "@/lib/projects";
import { requireWorkspace } from "@/lib/session";

const fields = (form: FormData) => ({ name: String(form.get("name") ?? ""), description: String(form.get("description") ?? "") });

export async function createProjectAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "project:write");
    const project = await createProject(ctx.workspace.id, ctx.user.id, fields(form));
    revalidatePath("/projects");
    return { ok: `Created ${project.name}.` };
  });
}

export async function updateProjectAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "project:write");
    const project = await updateProject(ctx.workspace.id, String(form.get("id")), fields(form));
    if (!project) return { error: "Project not found." };
    revalidatePath("/projects");
    return { ok: "Saved." };
  });
}

export async function deleteProjectAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "project:write");
    await deleteProject(ctx.workspace.id, String(form.get("id")));
    revalidatePath("/projects");
    redirect("/projects");
  });
}
