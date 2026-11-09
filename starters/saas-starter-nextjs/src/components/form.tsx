"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { CopyField } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/action";
import { cn } from "@/lib/utils";

export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

const FormState = createContext<ActionState>(null);

/**
 * A form bound to a server action. Values stay in the fields after an error (React would otherwise
 * reset the form when the action finishes), field errors show under each field, and success shows as
 * a toast.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  showSuccess,
  onSuccess,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  /** Show the success message in the form (for messages people need to read) instead of a toast. */
  showSuccess?: boolean;
  onSuccess?: (state: NonNullable<ActionState>) => void;
}) {
  // The toast fires as soon as the action answers, so it shows even when the form unmounts in the same
  // update (a deleted row's menu, a dialog that closes).
  const [state, dispatch] = useActionState(async (prev: ActionState, data: FormData) => {
    const next = await action(prev, data);
    if (next?.ok && !showSuccess) toast.success(next.ok);
    return next;
  }, null);
  const ref = useRef<HTMLFormElement>(null);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });
  useEffect(() => {
    if (!state?.ok) return;
    if (resetOnSuccess) ref.current?.reset();
    onSuccessRef.current?.(state);
  }, [state, resetOnSuccess]);

  return (
    <FormState.Provider value={state}>
      <form
        ref={ref}
        action={dispatch}
        noValidate
        onSubmit={(event) => {
          // Dispatching ourselves (instead of letting React run the action) skips React's automatic
          // form reset, so a failed submit keeps what the person typed. useFormStatus still works.
          event.preventDefault();
          const data = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
          startTransition(() => dispatch(data));
        }}
        className={cn("space-y-4", className)}
      >
        {children}
        <FormMessage state={state} showSuccess={showSuccess} />
      </form>
    </FormState.Provider>
  );
}

export function FormMessage({ state, showSuccess }: { state: ActionState; showSuccess?: boolean }) {
  return (
    <div aria-live="polite" className="space-y-3 text-sm empty:hidden">
      {state?.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}
      {showSuccess && state?.ok && <p role="status" className="rounded-lg border bg-surface px-3 py-2">{state.ok}</p>}
      {state?.secret && (
        <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="font-medium">Copy this key now. It will not be shown again.</p>
          <CopyField value={state.secret} label="New API key" />
        </div>
      )}
      {state?.link && (
        <div className="space-y-2 rounded-lg border bg-surface p-3">
          <p className="font-medium">Invite link</p>
          <CopyField value={state.link} label="Invite link" />
        </div>
      )}
    </div>
  );
}

export function SubmitButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending || undefined} {...props}>
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}

/** The message for `name` from the last submit, for custom controls (selects) that render their own label. */
export function useFieldError(name: string) {
  return useContext(FormState)?.fieldErrors?.[name];
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

type FieldProps = { label: string; name: string; hint?: string };

function useFieldIds(name: string, id: string | undefined, hint?: string) {
  const error = useFieldError(name);
  const fieldId = id ?? name;
  const describedBy = [hint && `${fieldId}-hint`, error && `${fieldId}-error`].filter(Boolean).join(" ") || undefined;
  return { error, fieldId, describedBy };
}

export function Field({ label, name, hint, ...props }: React.ComponentProps<typeof Input> & FieldProps) {
  const { error, fieldId, describedBy } = useFieldIds(name, props.id, hint);
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} name={name} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      {hint && (
        <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldError id={`${fieldId}-error`} message={error} />
    </div>
  );
}

export function TextareaField({ label, name, hint, ...props }: React.ComponentProps<typeof Textarea> & FieldProps) {
  const { error, fieldId, describedBy } = useFieldIds(name, props.id, hint);
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea id={fieldId} name={name} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      {hint && (
        <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldError id={`${fieldId}-error`} message={error} />
    </div>
  );
}
