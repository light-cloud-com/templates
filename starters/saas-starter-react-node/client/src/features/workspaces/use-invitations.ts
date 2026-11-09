import { useQuery } from "@tanstack/react-query";
import { authClient, unwrap } from "@/lib/auth-client";

/** The workspace's invitations that can still be accepted, newest first. */
export function usePendingInvitations(organizationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["invitations", organizationId],
    enabled: !!organizationId && enabled,
    queryFn: async () => {
      const all = await unwrap(authClient.organization.listInvitations({ query: { organizationId } }));
      const now = Date.now();
      return all
        .filter((i) => i.status === "pending" && new Date(i.expiresAt).getTime() > now)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });
}

export type PendingInvitation = NonNullable<ReturnType<typeof usePendingInvitations>["data"]>[number];
