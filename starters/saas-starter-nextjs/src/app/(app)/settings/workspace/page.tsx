import type { Metadata } from "next";
import { ConfirmAction } from "@/components/confirm-action";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRole } from "@/lib/format";
import { can } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { limits } from "@/lib/validation";
import { deleteWorkspaceAction, leaveWorkspaceAction, renameWorkspaceAction } from "./actions";

export const metadata: Metadata = { title: "Workspace settings" };

export default async function WorkspaceSettingsPage() {
  const { workspace, role } = await requireWorkspace();
  const editable = can(role, "workspace:update");
  const owner = can(role, "workspace:delete");
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
          <div className="space-y-1.5">
            <CardTitle><h2>General</h2></CardTitle>
            <CardDescription>{editable ? "The name everyone in the workspace sees." : "Only owners and admins can rename the workspace."}</CardDescription>
          </div>
          <Badge variant="secondary">Your role: {formatRole(role)}</Badge>
        </CardHeader>
        <CardContent>
          <ActionForm action={renameWorkspaceAction} className="max-w-md">
            <Field label="Workspace name" name="name" defaultValue={workspace.name} required maxLength={limits.workspaceName} disabled={!editable} />
            {editable && <SubmitButton>Save</SubmitButton>}
          </ActionForm>
        </CardContent>
      </Card>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle><h2>{owner ? "Delete workspace" : "Leave workspace"}</h2></CardTitle>
          <CardDescription>
            {owner
              ? `Deletes ${workspace.name} with its projects, members, invitations and API keys, for good.`
              : `You will lose access to ${workspace.name} until someone invites you again.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {owner ? (
            <ConfirmAction
              trigger={<Button variant="destructive-outline">Delete workspace</Button>}
              action={deleteWorkspaceAction}
              title={`Delete ${workspace.name}?`}
              description="Its projects, members, invitations and API keys are deleted for good. This cannot be undone."
              confirmLabel="Delete workspace"
            >
              <Field label={`Type ${workspace.name} to confirm`} name="confirm" autoComplete="off" required />
            </ConfirmAction>
          ) : (
            <ConfirmAction
              trigger={<Button variant="destructive-outline">Leave workspace</Button>}
              action={leaveWorkspaceAction}
              title={`Leave ${workspace.name}?`}
              description="You will need a new invitation to come back."
              confirmLabel="Leave workspace"
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
