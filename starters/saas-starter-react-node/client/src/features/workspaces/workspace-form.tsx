import { useState } from "react";
import { Field, FormError, SubmitButton } from "@/components/field";
import { authClient, unwrap } from "@/lib/auth-client";
import { LIMITS, workspaceInput } from "@shared/schemas.ts";

// Slugs must be unique; a short random suffix avoids asking the user for one.
function slugify(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workspace";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Creates a workspace and makes it the active one, or renames `workspace` when given. */
export function WorkspaceForm({ workspace, onDone, submitLabel = "Create workspace", secondary }: {
  workspace?: { id: string; name: string };
  onDone: (id: string) => void;
  submitLabel?: string;
  secondary?: React.ReactNode;
}) {
  const [error, setError] = useState<{ name?: string; form?: string }>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = workspaceInput.safeParse({ name: new FormData(e.currentTarget).get("name") });
    if (!parsed.success) return setError({ name: parsed.error.issues[0]?.message });
    setPending(true);
    setError({});
    try {
      if (workspace) {
        if (parsed.data.name !== workspace.name) {
          await unwrap(authClient.organization.update({ organizationId: workspace.id, data: { name: parsed.data.name } }));
        }
        onDone(workspace.id);
      } else {
        const org = await unwrap(authClient.organization.create({ name: parsed.data.name, slug: slugify(parsed.data.name) }));
        await unwrap(authClient.organization.setActive({ organizationId: org.id }));
        onDone(org.id);
      }
    } catch (err) {
      setError({ form: (err as Error).message });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormError message={error.form} />
      <Field label="Workspace name" id="name" placeholder="Acme Inc" autoComplete="organization" defaultValue={workspace?.name}
        maxLength={LIMITS.workspaceName} required autoFocus error={error.name} hint="Usually your company or team name. You can change it later." />
      <div className="flex flex-wrap items-center justify-end gap-2">
        {secondary}
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
