import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { DataTable } from "@/components/data-table";
import { ListSkeleton, ErrorState } from "@/components/states";
import { authClient, unwrap } from "@/lib/auth-client";
import { formatDate, timeAgo } from "@/lib/format";
import { usePendingInvitations } from "./use-invitations";

const linkFor = (id: string) => `${window.location.origin}/invite/${id}`;

/** Invitations not yet accepted, with their link to copy and a way to cancel them. */
export function PendingInvitations({ organizationId, canCancel, stacked }: { organizationId: string; canCancel: boolean; stacked?: boolean }) {
  const { data, isPending, error, refetch } = usePendingInvitations(organizationId);
  const queryClient = useQueryClient();
  if (isPending) return <ListSkeleton rows={1} />;
  if (error) return <ErrorState title="Could not load invitations" error={error} onRetry={() => void refetch()} />;
  if (data.length === 0) return null;

  const cancel = async (invitationId: string, email: string) => {
    await unwrap(authClient.organization.cancelInvitation({ invitationId }));
    await Promise.all([queryClient.invalidateQueries({ queryKey: ["invitations"] }), queryClient.invalidateQueries({ queryKey: ["workspace"] })]);
    toast.success(`Invitation for ${email} cancelled`);
  };

  return (
    <DataTable
      label="Pending invitations"
      stacked={stacked}
      rows={data}
      rowKey={(i) => i.id}
      name={(i) => i.email}
      primary={(i) => <span className="block truncate font-medium">{i.email}</span>}
      columns={[
        { header: "Email", cell: (i) => <span className="font-medium">{i.email}</span>, hideOnCard: true },
        { header: "Role", cell: (i) => <Badge variant="outline" className="capitalize">{i.role}</Badge> },
        { header: "Sent", cell: (i) => <span title={formatDate(i.createdAt)}>{timeAgo(i.createdAt)}</span> },
        { header: "Expires", cell: (i) => formatDate(i.expiresAt) },
        { header: "Link", cell: (i) => <CopyButton value={linkFor(i.id)} toastMessage="Invitation link copied">Copy link</CopyButton> },
      ]}
      actions={canCancel ? (i) => [{
        label: "Cancel invitation", destructive: true, onSelect: () => cancel(i.id, i.email),
        confirm: { title: `Cancel the invitation for ${i.email}?`, description: "Its link stops working. You can invite them again later.", action: "Cancel invitation" },
      }] : undefined}
    />
  );
}
