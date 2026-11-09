import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authClient, unwrap, useActiveOrganization, useSession } from "@/lib/auth-client";
import { useAppConfig, useCan } from "@/lib/queries";
import { InviteForm } from "@/features/workspaces/invite-form";
import { Section } from "./section";

export function MembersSettings() {
  const { data: org, refetch } = useActiveOrganization();
  const me = useSession().data?.user.id;
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const canManage = useCan({ member: ["update"] });
  const canInvite = useCan({ invitation: ["create"] });
  const queryClient = useQueryClient();
  if (!org) return null;

  const run = async (action: Promise<{ data: unknown; error: { message?: string } | null }>, success: string) => {
    try {
      await unwrap(action);
      toast.success(success);
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["workspace"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };
  const copyLink = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/invite/${id}`);
    toast.success("Invitation link copied");
  };
  const pending = org.invitations.filter((i) => i.status === "pending");

  return (
    <>
      {canInvite && (
        <Section title="Invite people"
          description={emailEnabled ? "They get an email with a link to join." : "Email is not set up yet: copy the invitation link below and send it yourself. It is also in the server log."}>
          <InviteForm organizationId={org.id} onInvited={() => void refetch()} />
        </Section>
      )}
      <Section title="Members" description="Owners manage billing and can delete the workspace. Admins manage members and settings. Members use the app.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {org.members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell><div className="font-medium">{m.user.name}{m.userId === me && " (you)"}</div><div className="text-muted-foreground text-xs">{m.user.email}</div></TableCell>
                  <TableCell>
                    {canManage && m.role !== "owner" && m.userId !== me ? (
                      <Select value={m.role} onValueChange={(role) => run(authClient.organization.updateMemberRole({ memberId: m.id, role: role as "admin" | "member", organizationId: org.id }), "Role updated")}>
                        <SelectTrigger className="w-28" aria-label={`Role for ${m.user.email}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : <Badge variant="secondary" className="capitalize">{m.role}</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManage && m.role !== "owner" && m.userId !== me && (
                      <Button size="sm" variant="ghost" onClick={() => run(authClient.organization.removeMember({ memberIdOrEmail: m.id, organizationId: org.id }), "Member removed")}>Remove</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>
      {pending.length > 0 && (
        <Section title="Pending invitations">
          <ul className="divide-y">
            {pending.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>{i.email} <Badge variant="outline" className="ml-1 capitalize">{i.role}</Badge></span>
                <span className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => copyLink(i.id)}><Copy aria-hidden /> Copy link</Button>
                  {canInvite && <Button size="sm" variant="ghost" onClick={() => run(authClient.organization.cancelInvitation({ invitationId: i.id }), "Invitation cancelled")}>Cancel</Button>}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
