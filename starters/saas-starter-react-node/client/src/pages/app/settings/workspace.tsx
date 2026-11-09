import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/confirm";
import { Field, FormError, SubmitButton } from "@/components/field";
import { ListSkeleton } from "@/components/states";
import { authClient, unwrap, useActiveOrganization } from "@/lib/auth-client";
import { useCan, useWorkspace } from "@/lib/queries";
import { LIMITS, workspaceInput } from "@shared/schemas.ts";
import { Section } from "./section";

export function WorkspaceSettings() {
  const org = useActiveOrganization().data;
  const role = useWorkspace().data?.role;
  const canEdit = useCan({ organization: ["update"] });
  const canDelete = useCan({ organization: ["delete"] });
  const [errors, setErrors] = useState<{ name?: string; form?: string }>({});
  const [pending, setPending] = useState(false);
  if (!org) return <ListSkeleton rows={2} />;

  async function rename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = workspaceInput.safeParse({ name: new FormData(e.currentTarget).get("name") });
    if (!parsed.success) return setErrors({ name: parsed.error.issues[0]?.message });
    setErrors({});
    setPending(true);
    try {
      await unwrap(authClient.organization.update({ organizationId: org!.id, data: { name: parsed.data.name } }));
      toast.success("Workspace renamed");
    } catch (err) {
      setErrors({ name: (err as Error).message });
    } finally {
      setPending(false);
    }
  }

  async function leaveOrDelete(kind: "leave" | "delete") {
    const organizationId = org!.id;
    if (kind === "delete") await unwrap(authClient.organization.delete({ organizationId }));
    else await unwrap(authClient.organization.leave({ organizationId }));
    // A full load picks the next workspace (or asks for a new one).
    window.location.assign("/dashboard");
  }

  return (
    <>
      <Section title="General" description={canEdit ? "The name your team sees in the workspace switcher and in emails." : "Only owners and admins can change these."}>
        <form onSubmit={rename} noValidate className="grid max-w-md gap-4">
          <FormError message={errors.form} />
          <Field label="Workspace name" id="name" defaultValue={org.name} disabled={!canEdit} maxLength={LIMITS.workspaceName} required error={errors.name} />
          {canEdit && <SubmitButton pending={pending} className="justify-self-start">Save</SubmitButton>}
        </form>
      </Section>
      {canDelete ? (
        <Section title="Delete workspace" danger description="Removes its projects, members, invitations and API keys for everyone.">
          <Confirm trigger={<Button variant="destructive-outline">Delete workspace</Button>} title={`Delete ${org.name}?`}
            description="Everything in this workspace is removed for everyone. Cancel any paid subscription first. This cannot be undone."
            confirmText={org.name} action="Delete workspace" onConfirm={() => leaveOrDelete("delete")} />
        </Section>
      ) : role && (
        <Section title="Leave workspace" danger description="You lose access to its projects and need a new invitation to come back.">
          <Confirm trigger={<Button variant="destructive-outline">Leave workspace</Button>} title={`Leave ${org.name}?`}
            description="You will lose access to its projects. Someone has to invite you again to come back." action="Leave workspace" onConfirm={() => leaveOrDelete("leave")} />
        </Section>
      )}
    </>
  );
}
