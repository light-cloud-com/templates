import { useState, type ReactNode } from "react";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Field, FormError, SubmitButton } from "@/components/field";

interface ConfirmProps {
  title: string;
  description: ReactNode;
  action: string;
  /** Throw to keep the dialog open and show the message inside it. */
  onConfirm: () => unknown | Promise<unknown>;
  /** Opens the dialog; omit and pass open/onOpenChange to control it from a menu. */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The confirm button stays disabled until this exact text is typed. */
  confirmText?: string;
  /** Extra fields (e.g. a password) shown above the buttons. */
  children?: ReactNode;
  destructive?: boolean;
}

/** Asks before something that cannot be undone, and shows a failure without closing. */
export function Confirm({ title, description, action, onConfirm, trigger, open, onOpenChange, confirmText, children, destructive = true }: ConfirmProps) {
  const [ownOpen, setOwnOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOpen = open ?? ownOpen;
  const setOpen = (next: boolean) => {
    if (pending) return;
    if (!next) { setTyped(""); setError(null); }
    setOwnOpen(next);
    onOpenChange?.(next);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setPending(false);
      setOpen(false);
    } catch (err) {
      setPending(false);
      setError((err as Error).message || "Something went wrong");
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {children}
          {confirmText && (
            <Field label={`Type ${confirmText} to confirm`} id="confirm-text" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          )}
          <FormError message={error} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>Cancel</AlertDialogCancel>
            <SubmitButton variant={destructive ? "destructive" : "default"} pending={pending} disabled={!!confirmText && typed.trim() !== confirmText}>
              {action}
            </SubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
