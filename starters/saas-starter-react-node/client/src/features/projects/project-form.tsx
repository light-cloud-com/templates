import { useState } from "react";
import { Field, FormError, SubmitButton, TextareaField } from "@/components/field";
import { fieldErrors, type FieldErrors } from "@/lib/forms";
import { LIMITS, projectInput, type Project, type ProjectInput } from "@shared/schemas.ts";

export function ProjectForm({ project, onSubmit, submitLabel, disabled }: {
  project?: Project;
  onSubmit: (input: ProjectInput) => Promise<unknown>;
  submitLabel: string;
  disabled?: boolean;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = projectInput.safeParse({ name: form.get("name"), description: form.get("description") });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setPending(true);
    setErrors({});
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setErrors({ form: (err as Error).message });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handle} noValidate className="grid gap-4">
      <FormError message={errors.form} />
      <Field label="Name" id="name" defaultValue={project?.name} maxLength={LIMITS.projectName} required disabled={disabled} error={errors.name} placeholder="Website relaunch" />
      <TextareaField label="Description" id="description" defaultValue={project?.description} maxLength={LIMITS.projectDescription} rows={3} disabled={disabled} error={errors.description}
        hint="Optional." />
      {!disabled && <SubmitButton pending={pending} className="justify-self-start">{submitLabel}</SubmitButton>}
    </form>
  );
}
