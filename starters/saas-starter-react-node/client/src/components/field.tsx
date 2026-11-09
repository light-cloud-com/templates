import type { ComponentProps, ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  id: string;
  hint?: ReactNode;
  error?: string | null;
}

function describedBy(id: string, hint?: ReactNode, error?: string | null) {
  return [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
}

function FieldMessages({ id, hint, error }: Omit<FieldProps, "label">) {
  return (
    <>
      {error && <p id={`${id}-error`} className="text-destructive text-[0.8125rem]">{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className="text-muted-foreground text-[0.8125rem]">{hint}</p>}
    </>
  );
}

/** A labelled input with its hint or error underneath, tied together for screen readers. */
export function Field({ label, id, hint, error, className, ...props }: ComponentProps<typeof Input> & FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...props} />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextareaField({ label, id, hint, error, className, ...props }: ComponentProps<typeof Textarea> & FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} name={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...props} />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

/** An error that belongs to the whole form rather than one field. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

/** A submit button that shows a spinner and stays disabled while the form is sending. */
export function SubmitButton({ pending, children, ...props }: ComponentProps<typeof Button> & { pending?: boolean }) {
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending || undefined} {...props}>
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}
