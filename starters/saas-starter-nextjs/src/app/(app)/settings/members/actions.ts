"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { emailEnabled } from "@/lib/config";
import { assertCan } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { baseUrl } from "@/lib/url";
import { email, parseForm } from "@/lib/validation";

const role = z.enum(["member", "admin", "owner"], "Pick a role");

/** Invites by email and answers with the invite link, so it can be shared even without an email provider. */
export async function inviteMemberAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "member:manage");
    const body = parseForm(form, { email, role: role.catch("member") });
    if (body.role === "owner") assertCan(ctx.role, "billing:manage"); // only owners make owners
    const h = await headers();
    const invitation = await auth.api.createInvitation({ body: { ...body, organizationId: ctx.workspace.id }, headers: h });
    revalidatePath("/", "layout");
    return {
      ok: emailEnabled ? `Invitation sent to ${body.email}` : `Invitation created for ${body.email}`,
      link: `${baseUrl(h)}/invite/${invitation.id}`,
    };
  });
}

export async function cancelInvitationAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "member:manage");
    await auth.api.cancelInvitation({ body: { invitationId: String(form.get("invitationId")) }, headers: await headers() });
    revalidatePath("/", "layout");
    return { ok: "Invitation cancelled" };
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
    revalidatePath("/", "layout");
    return { ok: "Role updated" };
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
    revalidatePath("/", "layout");
    return { ok: "Member removed" };
  });
}
