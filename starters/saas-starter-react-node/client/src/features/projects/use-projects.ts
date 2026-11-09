import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useActiveWorkspaceId } from "@/lib/queries";
import type { Project } from "@shared/schemas.ts";

export function useProjects() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({ queryKey: ["projects", workspaceId], queryFn: () => api<Project[]>("/projects"), enabled: !!workspaceId });
}
