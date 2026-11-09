import type { Metadata } from "next";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { limits } from "@/lib/validation";
import { createWorkspaceAction } from "../../actions";

export const metadata: Metadata = { title: "New workspace" };

export default function NewWorkspacePage() {
  return (
    <>
      <PageHeader title="New workspace" description="A workspace has its own members, projects, API keys and plan. You become its owner." />
      <Card className="max-w-lg">
        <CardContent>
          <ActionForm action={createWorkspaceAction}>
            <input type="hidden" name="next" value="/dashboard" />
            <Field label="Workspace name" name="name" placeholder="e.g. Acme Inc" required maxLength={limits.workspaceName} autoFocus />
            <SubmitButton>Create workspace</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
    </>
  );
}
