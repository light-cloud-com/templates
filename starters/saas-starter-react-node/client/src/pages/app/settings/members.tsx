import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { ListSkeleton } from "@/components/states";
import { UserAvatar } from "@/components/user-avatar";
import { authClient, unwrap, useActiveOrganization, useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import { useAppConfig, useCan, useShowSetupHints, useWorkspace } from "@/lib/queries";
import { InviteForm } from "@/features/workspaces/invite-form";
import { PendingInvitations } from "@/features/workspaces/pending-invitations";
import { usePendingInvitations } from "@/features/workspaces/use-invitations";
import { getPlan } from "@shared/plans.ts";
import { Section } from "./section";

export function MembersSettings() {
  const { data: org, refetch } = useActiveOrganization();
  const me = useSession().data?.user.id;
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const hints = useShowSetupHints();
  const ws = useWorkspace().data;
  const canManage = useCan({ member: ["update"] });
  const canInvite = useCan({ invitation: ["create"] });
  const queryClient = useQueryClient();
  // Only owners and admins may list invitations.
  const invitations = usePendingInvitations(org?.id, canInvite).data;
  if (!org) return <ListSkeleton rows={3} />;

  const after = async (message: string) => {
    toast.success(message);
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ["workspace"] });
  };
  const setRole = async (memberId: string, role: string, name: string) => {
    try {
      await unwrap(authClient.organization.updateMemberRole({ memberId, role: role as "admin" | "member", organizationId: org.id }));
      await after(`${name} is now ${role === "admin" ? "an admin" : "a member"}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };
  const limit = getPlan(ws?.plan).limits.members;
  type Member = (typeof org.members)[number];
  const editable = (m: Member) => canManage && m.role !== "owner" && m.userId !== me;

  return (
    <>
      {canInvite && (
        <Section title="Invite people"
          description={`${emailEnabled ? "They get an email with a link to join." : "Copy the invitation link from the list below and send it to them."}${limit !== null ? ` Your plan allows ${limit} members, counting pending invitations.` : ""}`}>
          <InviteForm organizationId={org.id} />
          {!emailEnabled && hints && (
            <p className="text-muted-foreground mt-3 text-xs">Email is not set up on this deployment (no RESEND_API_KEY), so invitation emails are written to the server log instead.</p>
          )}
        </Section>
      )}
      {!!invitations?.length && (
        <Section title="Pending invitations" description="Each link works once and expires after 7 days.">
          <PendingInvitations organizationId={org.id} canCancel={canInvite} />
        </Section>
      )}
      <Section title="Members" description="Owners manage billing and can delete the workspace. Admins manage members and settings. Members create and edit projects.">
        <DataTable
          label="Members"
          rows={org.members}
          rowKey={(m) => m.id}
          name={(m) => m.user.name || m.user.email}
          primary={(m) => <Person m={m} me={m.userId === me} />}
          columns={[
            { header: "Name", cell: (m) => <Person m={m} me={m.userId === me} />, hideOnCard: true },
            {
              header: "Role",
              cell: (m) => editable(m) ? (
                <Select value={m.role} onValueChange={(role) => void setRole(m.id, role, m.user.name || m.user.email)}>
                  <SelectTrigger size="sm" className="ml-auto w-28 sm:ml-0" aria-label={`Role for ${m.user.email}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              ) : <Badge variant="secondary" className="capitalize">{m.role}</Badge>,
            },
            { header: "Joined", cell: (m) => formatDate(m.createdAt) },
          ]}
          actions={canManage ? (m) => editable(m) ? [{
            label: "Remove from workspace", destructive: true,
            onSelect: async () => {
              await unwrap(authClient.organization.removeMember({ memberIdOrEmail: m.id, organizationId: org.id }));
              await after(`${m.user.name || m.user.email} was removed`);
            },
            confirm: { title: `Remove ${m.user.name || m.user.email}?`, description: "They lose access to this workspace and its projects straight away.", action: "Remove member" },
          }] : [] : undefined}
        />
      </Section>
    </>
  );
}

function Person({ m, me }: { m: { userId: string; user: { name: string; email: string; image?: string | null } }; me: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <UserAvatar name={m.user.name || m.user.email} seed={m.userId} image={m.user.image} />
      <span className="grid min-w-0">
        <span className="truncate font-medium">{m.user.name}{me && <span className="text-muted-foreground font-normal"> (you)</span>}</span>
        <span className="text-muted-foreground truncate text-xs">{m.user.email}</span>
      </span>
    </span>
  );
}
