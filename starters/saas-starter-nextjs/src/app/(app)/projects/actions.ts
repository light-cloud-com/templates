"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, runAction } from "@/lib/action";
import { flash } from "@/lib/flash";
import { assertCan } from "@/lib/permissions";
import { createProject, deleteProject, updateProject } from "@/lib/projects";
import { requireWorkspace } from "@/lib/session";

const fields = (form: FormData) => ({ name: String(form.get("name") ?? ""), description: String(form.get("description") ?? "") });

export async function createProjectAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "project:write");
    const project = await createProject(ctx.workspace.id, ctx.user.id, fields(form));
    revalidatePath("/", "layout");
    return { ok: `Created ${project.name}` };
  });
}

export async function updateProjectAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "project:write");
    const project = await updateProject(ctx.workspace.id, String(form.get("id")), fields(form));
    if (!project) return { error: "This project no longer exists." };
    revalidatePath("/", "layout");
    return { ok: "Project saved" };
  });
}

/** Members create and edit projects; deleting is for owners and admins. */
export async function deleteProjectAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "project:delete");
    const deleted = await deleteProject(ctx.workspace.id, String(form.get("id")));
    if (!deleted) return { error: "This project no longer exists." };
    revalidatePath("/", "layout");
    // From the project's own page, go back to the list; from the list, stay.
    if (form.get("from") === "detail") {
      await flash("Project deleted");
      redirect("/projects");
    }
    return { ok: "Project deleted" };
  });
}
