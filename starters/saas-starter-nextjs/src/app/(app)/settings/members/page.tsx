import { and, asc, eq } from "drizzle-orm";
import { MailPlus, Trash2, UserMinus } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { Avatar } from "@/components/avatar";
import { RowActions } from "@/components/confirm-action";
import { CopyButton } from "@/components/copy-button";
import { CardList, CardListItem } from "@/components/data-list";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { emailEnabled } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { formatDate, formatRole } from "@/lib/format";
import { can } from "@/lib/permissions";
import { getPlan } from "@/lib/plans";
import { isPlatformAdmin, requireWorkspace } from "@/lib/session";
import { baseUrl } from "@/lib/url";
import { limits } from "@/lib/validation";
import { cancelInvitationAction, inviteMemberAction, removeMemberAction } from "./actions";
import { InviteRoleSelect, RoleSelect } from "./role-select";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const { workspace, role, plan, user } = await requireWorkspace();
  const manage = can(role, "member:manage");
  const isOwner = can(role, "billing:manage");
  const [members, invitations] = await Promise.all([
    db
      .select({ id: schema.member.id, role: schema.member.role, createdAt: schema.member.createdAt, userId: schema.user.id, name: schema.user.name, email: schema.user.email })
      .from(schema.member)
      .innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
      .where(eq(schema.member.organizationId, workspace.id))
      .orderBy(asc(schema.member.createdAt)),
    manage
      ? db
          .select()
          .from(schema.invitation)
          .where(and(eq(schema.invitation.organizationId, workspace.id), eq(schema.invitation.status, "pending")))
          .orderBy(asc(schema.invitation.createdAt))
      : Promise.resolve([]),
  ]);
  const origin = baseUrl(await headers());
  const seats = getPlan(plan).limits.members;
  const roles = isOwner ? ["member", "admin", "owner"] : ["member", "admin"];
  // Admins cannot change or remove owners, nobody changes themselves here (Leave is in Workspace).
  const editable = (m: (typeof members)[number]) => manage && m.userId !== user.id && (isOwner || !m.role.includes("owner"));

  const roleCell = (m: (typeof members)[number]) =>
    editable(m) ? (
      <RoleSelect memberId={m.id} role={m.role} roles={roles} name={m.name} />
    ) : (
      <Badge variant="secondary">{formatRole(m.role)}</Badge>
    );
  const menu = (m: (typeof members)[number]) =>
    editable(m) ? (
      <RowActions
        label={`Actions for ${m.name}`}
        actions={[{
          label: "Remove from workspace",
          icon: <UserMinus aria-hidden />,
          destructive: true,
          confirm: {
            action: removeMemberAction,
            fields: { memberId: m.id },
            title: `Remove ${m.name}?`,
            description: `${m.name} loses access to ${workspace.name} straight away. You can invite them again later.`,
            confirmLabel: "Remove member",
          },
        }]}
      />
    ) : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><h2>Members</h2></CardTitle>
          <CardDescription>
            {members.length} of {seats ?? "unlimited"} seats used. Owners handle billing, admins manage members and settings, members work on projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={m.name} seed={m.email} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{m.name}{m.userId === user.id && <span className="font-normal text-muted-foreground"> (you)</span>}</p>
                          <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{roleCell(m)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(m.createdAt)}</TableCell>
                    <TableCell className="text-right">{menu(m)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <CardList label="Members">
            {members.map((m) => (
              <CardListItem key={m.id} actions={menu(m)}>
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} seed={m.email} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.name}{m.userId === user.id && <span className="font-normal text-muted-foreground"> (you)</span>}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {roleCell(m)}
                  <span className="text-xs text-muted-foreground">Joined {formatDate(m.createdAt)}</span>
                </div>
              </CardListItem>
            ))}
          </CardList>
          {!manage && <p className="pt-4 text-muted-foreground">Only owners and admins can invite people or change roles. Ask one of them if you need someone added.</p>}
        </CardContent>
      </Card>

      {manage && (
        <Card>
          <CardHeader>
            <CardTitle><h2>Invite people</h2></CardTitle>
            <CardDescription>
              {emailEnabled ? "They get an email with a link to join. You can also copy the link." : "Copy the invite link and send it to them yourself."}
              {!emailEnabled && isPlatformAdmin(user) && " (Admins only: email is off until RESEND_API_KEY is set; invite emails go to the server log.)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm action={inviteMemberAction} resetOnSuccess className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-start">
                <Field label="Email" name="email" type="email" placeholder="name@example.com" autoComplete="off" maxLength={limits.email} required />
                <InviteRoleSelect roles={roles} />
                <SubmitButton className="sm:mt-[22px]"><MailPlus aria-hidden /> Send invite</SubmitButton>
              </div>
            </ActionForm>
          </CardContent>
        </Card>
      )}

      {manage && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle><h2>Pending invitations</h2></CardTitle>
            <CardDescription>Links work for 7 days. Copy one to send it again.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y rounded-lg border">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:px-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">{formatRole(inv.role)} · expires {formatDate(inv.expiresAt)}</p>
                  </div>
                  <CopyButton value={`${origin}/invite/${inv.id}`} label={`Copy invite link for ${inv.email}`} />
                  <RowActions
                    label={`Actions for the invitation to ${inv.email}`}
                    actions={[{
                      label: "Cancel invitation",
                      icon: <Trash2 aria-hidden />,
                      destructive: true,
                      confirm: {
                        action: cancelInvitationAction,
                        fields: { invitationId: inv.id },
                        title: `Cancel the invitation to ${inv.email}?`,
                        description: "The link stops working. You can invite them again later.",
                        confirmLabel: "Cancel invitation",
                        cancelLabel: "Keep it",
                      },
                    }]}
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
