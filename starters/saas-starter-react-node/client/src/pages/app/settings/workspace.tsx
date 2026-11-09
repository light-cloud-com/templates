import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/field";
import { authClient, unwrap, useActiveOrganization } from "@/lib/auth-client";
import { useCan, useWorkspace } from "@/lib/queries";
import { workspaceInput } from "@shared/schemas.ts";
import { Confirm } from "@/components/confirm";
import { Section } from "./section";

export function WorkspaceSettings() {
  const org = useActiveOrganization().data;
  const role = useWorkspace().data?.role;
  const canEdit = useCan({ organization: ["update"] });
  const canDelete = useCan({ organization: ["delete"] });
  const [error, setError] = useState<string | null>(null);
  if (!org) return null;

  async function rename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = workspaceInput.safeParse({ name: new FormData(e.currentTarget).get("name") });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid name");
    try {
      await unwrap(authClient.organization.update({ organizationId: org!.id, data: { name: parsed.data.name } }));
      setError(null);
      toast.success("Workspace renamed");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function leaveOrDelete(kind: "leave" | "delete") {
    try {
      const organizationId = org!.id;
      if (kind === "delete") await unwrap(authClient.organization.delete({ organizationId }));
      else await unwrap(authClient.organization.leave({ organizationId }));
      window.location.assign("/dashboard");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <>
      <Section title="General" description={canEdit ? undefined : "Only owners and admins can change these."}>
        <form onSubmit={rename} className="grid max-w-sm gap-4">
          <Field label="Workspace name" id="name" defaultValue={org.name} disabled={!canEdit} required />
          <FormError message={error} />
          {canEdit && <Button type="submit" className="justify-self-start">Save</Button>}
        </form>
      </Section>
      <Section title="Danger zone" danger
        description={canDelete ? "Deleting the workspace removes its projects, members, invitations and API keys." : "Leave this workspace. You will need a new invitation to come back."}>
        {canDelete ? (
          <Confirm trigger={<Button variant="destructive">Delete workspace</Button>} title={`Delete ${org.name}?`}
            description="Everything in this workspace is removed for everyone. Cancel any paid subscription first. This cannot be undone."
            action="Delete workspace" onConfirm={() => leaveOrDelete("delete")} />
        ) : role && (
          <Confirm trigger={<Button variant="destructive">Leave workspace</Button>} title={`Leave ${org.name}?`}
            description="You will lose access to its projects." action="Leave" onConfirm={() => leaveOrDelete("leave")} />
        )}
      </Section>
    </>
  );
}
