"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";

const role = z.enum(["member", "admin", "owner"]);

export async function inviteMemberAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "member:manage");
    const body = z
      .object({ email: z.email("Enter a valid email address").transform((e) => e.toLowerCase()), role: role.default("member") })
      .parse({ email: form.get("email"), role: form.get("role") ?? undefined });
    if (body.role === "owner") assertCan(ctx.role, "billing:manage"); // only owners make owners
    await auth.api.createInvitation({ body: { ...body, organizationId: ctx.workspace.id }, headers: await headers() });
    revalidatePath("/settings/members");
    return { ok: `Invitation sent to ${body.email}. You can also copy the link below.` };
  });
}

export async function cancelInvitationAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "member:manage");
    await auth.api.cancelInvitation({ body: { invitationId: String(form.get("invitationId")) }, headers: await headers() });
    revalidatePath("/settings/members");
    return { ok: "Invitation cancelled." };
  });
}

export async function updateRoleAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "member:manage");
    const newRole = role.parse(form.get("role"));
    if (newRole === "owner") assertCan(ctx.role, "billing:manage");
    // Better Auth also stops admins from changing owners and keeps at least one owner.
    await auth.api.updateMemberRole({
      body: { memberId: String(form.get("memberId")), role: newRole, organizationId: ctx.workspace.id },
      headers: await headers(),
    });
    revalidatePath("/settings/members");
    return { ok: "Role updated." };
  });
}

export async function removeMemberAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "member:manage");
    await auth.api.removeMember({
      body: { memberIdOrEmail: String(form.get("memberId")), organizationId: ctx.workspace.id },
      headers: await headers(),
    });
    revalidatePath("/settings/members");
    return { ok: "Member removed." };
  });
}
