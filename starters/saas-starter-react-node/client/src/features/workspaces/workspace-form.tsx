import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/field";
import { authClient, unwrap } from "@/lib/auth-client";
import { workspaceInput } from "@shared/schemas.ts";

// Slugs must be unique; a short random suffix avoids asking the user for one.
function slugify(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workspace";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Creates a workspace and makes it the active one. */
export function WorkspaceForm({ onCreated, submitLabel = "Create workspace" }: { onCreated: (id: string) => void; submitLabel?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = workspaceInput.safeParse({ name: new FormData(e.currentTarget).get("name") });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid name");
    setPending(true);
    setError(null);
    try {
      const org = await unwrap(authClient.organization.create({ name: parsed.data.name, slug: slugify(parsed.data.name) }));
      await unwrap(authClient.organization.setActive({ organizationId: org.id }));
      onCreated(org.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field label="Workspace name" id="name" placeholder="Acme Inc" autoComplete="organization" required />
      <FormError message={error} />
      <Button type="submit" disabled={pending}>{pending ? "Creating…" : submitLabel}</Button>
    </form>
  );
}
