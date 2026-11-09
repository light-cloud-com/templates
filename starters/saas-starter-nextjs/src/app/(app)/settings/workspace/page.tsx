import type { Metadata } from "next";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { can } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { deleteWorkspaceAction, leaveWorkspaceAction, renameWorkspaceAction } from "./actions";

export const metadata: Metadata = { title: "Workspace settings" };

export default async function WorkspaceSettingsPage() {
  const { workspace, role } = await requireWorkspace();
  const editable = can(role, "workspace:update");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><h1>Workspace</h1></CardTitle>
          <CardDescription>Your role here: {role}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={renameWorkspaceAction}>
            <Field label="Workspace name" name="name" defaultValue={workspace.name} required maxLength={80} disabled={!editable} />
            {editable ? <SubmitButton>Save</SubmitButton> : <p className="text-sm text-muted-foreground">Only owners and admins can rename the workspace.</p>}
          </ActionForm>
        </CardContent>
      </Card>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle><h2>Danger zone</h2></CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {can(role, "workspace:delete") ? (
            <ActionForm action={deleteWorkspaceAction}>
              <p className="text-sm text-muted-foreground">Deleting {workspace.name} removes its projects, members, invitations and API keys for good.</p>
              <Field label={`Type ${workspace.name} to confirm`} name="confirm" autoComplete="off" required />
              <SubmitButton variant="destructive">Delete workspace</SubmitButton>
            </ActionForm>
          ) : (
            <ActionForm action={leaveWorkspaceAction}>
              <p className="text-sm text-muted-foreground">Leave {workspace.name}. You will need a new invitation to come back.</p>
              <SubmitButton variant="destructive">Leave workspace</SubmitButton>
            </ActionForm>
          )}
        </CardContent>
      </Card>
    </>
  );
}
