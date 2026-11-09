import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useSession } from "./auth-client";
import type { AppConfig, WorkspaceSummary } from "@shared/schemas.ts";
import { can, type Permission } from "@shared/permissions.ts";

export function useAppConfig() {
  return useQuery({ queryKey: ["config"], queryFn: () => api<AppConfig>("/config"), staleTime: Infinity });
}

export function useActiveWorkspaceId() {
  return useSession().data?.session.activeOrganizationId ?? null;
}

/** Plan, role and counts for the active workspace. */
export function useWorkspace() {
  const id = useActiveWorkspaceId();
  return useQuery({ queryKey: ["workspace", id], queryFn: () => api<WorkspaceSummary>("/me/workspace"), enabled: !!id });
}

/** Whether the current user's role in the active workspace allows something. UI only; the server checks again. */
export function useCan(permission: Permission) {
  const { data } = useWorkspace();
  return can(data?.role, permission);
}

/** Setup hints (env var names, server log) are for platform admins, or anyone in development. */
export function useShowSetupHints() {
  const isAdmin = useSession().data?.user.role === "admin";
  return isAdmin || import.meta.env.DEV;
}
