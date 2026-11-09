import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FocusLayout } from "@/components/layouts";
import { authClient, useListOrganizations } from "@/lib/auth-client";
import { useTitle } from "@/lib/title";
import { WorkspaceForm } from "@/features/workspaces/workspace-form";

export function NewWorkspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasWorkspace = !!useListOrganizations().data?.length;
  useTitle("New workspace");
  // With no workspace yet there is nothing to go back to, so the way out is signing out.
  const way = !hasWorkspace && (
    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => authClient.signOut().then(() => { queryClient.clear(); navigate("/"); })}>
      <LogOut aria-hidden /> Sign out
    </Button>
  );
  return (
    <FocusLayout aside={way}>
      <section className="bg-card rounded-xl border p-5 sm:p-8">
        <h1 className="text-xl font-semibold">Create a workspace</h1>
        <p className="text-muted-foreground mt-1 text-sm">A workspace holds a team's projects, members and billing. You can belong to several.</p>
        <div className="mt-6">
          <WorkspaceForm
            secondary={hasWorkspace && <Button asChild variant="ghost"><Link to="/dashboard">Cancel</Link></Button>}
            onDone={async () => { await queryClient.invalidateQueries(); toast.success("Workspace created"); navigate("/dashboard"); }} />
        </div>
      </section>
    </FocusLayout>
  );
}
