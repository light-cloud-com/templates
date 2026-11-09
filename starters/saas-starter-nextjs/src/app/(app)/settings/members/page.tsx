import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { emailEnabled } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { can } from "@/lib/permissions";
import { getPlan } from "@/lib/plans";
import { requireWorkspace } from "@/lib/session";
import { baseUrl } from "@/lib/url";
import { cancelInvitationAction, inviteMemberAction, removeMemberAction, updateRoleAction } from "./actions";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const { workspace, role, plan, user } = await requireWorkspace();
  const manage = can(role, "member:manage");
  const isOwner = can(role, "billing:manage");
  const [members, invitations] = await Promise.all([
    db
      .select({ id: schema.member.id, role: schema.member.role, userId: schema.user.id, name: schema.user.name, email: schema.user.email })
      .from(schema.member)
      .innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
      .where(eq(schema.member.organizationId, workspace.id))
      .orderBy(asc(schema.member.createdAt)),
    db
      .select()
      .from(schema.invitation)
      .where(and(eq(schema.invitation.organizationId, workspace.id), eq(schema.invitation.status, "pending")))
      .orderBy(asc(schema.invitation.createdAt)),
  ]);
  const origin = baseUrl(await headers());
  const seats = getPlan(plan).limits.members;
  const roles = isOwner ? ["member", "admin", "owner"] : ["member", "admin"];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><h1>Members</h1></CardTitle>
          <CardDescription>
            {members.length} of {seats ?? "unlimited"} seats used. Owners handle billing and can delete the workspace, admins manage members and settings, members use the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.name}{m.userId === user.id && " (you)"}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                </div>
                {manage && m.userId !== user.id && (isOwner || m.role !== "owner") ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <ActionForm action={updateRoleAction} className="flex items-center gap-2 space-y-0">
                      <input type="hidden" name="memberId" value={m.id} />
                      <Label htmlFor={`role-${m.id}`} className="sr-only">Role for {m.name}</Label>
                      <NativeSelect id={`role-${m.id}`} name="role" defaultValue={m.role}>
                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                      </NativeSelect>
                      <SubmitButton size="sm" variant="outline">Save</SubmitButton>
                    </ActionForm>
                    <ActionForm action={removeMemberAction} className="space-y-0">
                      <input type="hidden" name="memberId" value={m.id} />
                      <SubmitButton size="sm" variant="ghost" aria-label={`Remove ${m.name}`}>Remove</SubmitButton>
                    </ActionForm>
                  </div>
                ) : (
                  <Badge variant="secondary">{m.role}</Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {manage && (
        <Card>
          <CardHeader>
            <CardTitle><h2>Invite people</h2></CardTitle>
            <CardDescription>
              {emailEnabled ? "They get an email with a link to join." : "No email provider is set up: the invite email goes to the server logs. Copy the link below and send it yourself."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ActionForm action={inviteMemberAction} resetOnSuccess className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <Field label="Email" name="email" type="email" required />
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <NativeSelect id="invite-role" name="role" defaultValue="member" className="w-full">
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </NativeSelect>
              </div>
              <SubmitButton>Send invite</SubmitButton>
            </ActionForm>
            {invitations.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Pending invitations</h3>
                <ul className="divide-y rounded-md border">
                  {invitations.map((inv) => (
                    <li key={inv.id} className="space-y-2 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm"><span className="font-medium">{inv.email}</span> as {inv.role}</p>
                        <ActionForm action={cancelInvitationAction} className="space-y-0">
                          <input type="hidden" name="invitationId" value={inv.id} />
                          <SubmitButton size="sm" variant="ghost">Cancel</SubmitButton>
                        </ActionForm>
                      </div>
                      <Label htmlFor={`link-${inv.id}`} className="sr-only">Invite link for {inv.email}</Label>
                      <input id={`link-${inv.id}`} readOnly value={`${origin}/invite/${inv.id}`} className="w-full rounded-md border bg-muted px-2 py-1 font-mono text-xs" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
