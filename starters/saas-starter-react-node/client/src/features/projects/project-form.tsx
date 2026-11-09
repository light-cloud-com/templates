import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError } from "@/components/field";
import { projectInput, type Project, type ProjectInput } from "@shared/schemas.ts";

export function ProjectForm({ project, onSubmit, submitLabel }: {
  project?: Project;
  onSubmit: (input: ProjectInput) => Promise<unknown>;
  submitLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = projectInput.safeParse({ name: form.get("name"), description: form.get("description") });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid input");
    setPending(true);
    setError(null);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handle} className="grid gap-4">
      <Field label="Name" id="name" defaultValue={project?.name} maxLength={100} required />
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={project?.description} maxLength={500} rows={3} />
      </div>
      <FormError message={error} />
      <Button type="submit" disabled={pending} className="justify-self-start">{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
