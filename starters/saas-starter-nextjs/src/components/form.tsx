"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/action";
import { cn } from "@/lib/utils";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

/** A form bound to a server action, with its error or success message announced to screen readers. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={cn("space-y-4", className)}>
      {children}
      <FormMessage state={state} />
    </form>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  return (
    <div aria-live="polite" className="text-sm empty:hidden">
      {state?.error && <p className="text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-muted-foreground">{state.ok}</p>}
      {state?.secret && (
        <div className="mt-2 space-y-1">
          <p className="font-medium text-foreground">Copy it now, it will not be shown again:</p>
          <code className="block overflow-x-auto rounded-md border bg-muted p-2 text-xs break-all">{state.secret}</code>
        </div>
      )}
    </div>
  );
}

export function SubmitButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-disabled={pending} {...props}>
      {pending ? "Working…" : children}
    </Button>
  );
}

export function Field({ label, name, hint, ...props }: React.ComponentProps<typeof Input> & { label: string; name: string; hint?: string }) {
  const id = props.id ?? name;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
