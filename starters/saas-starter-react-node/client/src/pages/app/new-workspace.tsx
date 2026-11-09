import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/pages/auth/auth-card";
import { WorkspaceForm } from "@/features/workspaces/workspace-form";

export function NewWorkspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <AuthCard title="Create a workspace" description="A workspace holds your team's projects, members and billing.">
      <WorkspaceForm onCreated={async () => { await queryClient.invalidateQueries(); navigate("/dashboard"); }} />
    </AuthCard>
  );
}
