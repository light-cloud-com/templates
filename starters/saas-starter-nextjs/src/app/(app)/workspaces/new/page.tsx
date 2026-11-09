import type { Metadata } from "next";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWorkspaceAction } from "../../actions";

export const metadata: Metadata = { title: "New workspace" };

export default function NewWorkspacePage() {
  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle><h1>New workspace</h1></CardTitle></CardHeader>
      <CardContent>
        <ActionForm action={createWorkspaceAction}>
          <input type="hidden" name="next" value="/dashboard" />
          <Field label="Workspace name" name="name" placeholder="e.g. Acme Inc" required maxLength={80} />
          <SubmitButton>Create workspace</SubmitButton>
        </ActionForm>
      </CardContent>
    </Card>
  );
}
