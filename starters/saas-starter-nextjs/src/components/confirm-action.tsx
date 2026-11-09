"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActionForm, type FormAction, SubmitButton } from "@/components/form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Confirm = {
  action: FormAction;
  /** Hidden inputs sent with the action, e.g. { id }. */
  fields?: Record<string, string>;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Solid red confirm button (default) or the accent for non-destructive confirmations. */
  destructive?: boolean;
  /** Extra inputs shown in the dialog (a password, or the name to type). */
  children?: React.ReactNode;
};

/**
 * A confirmation dialog around a server action. With `trigger` it opens from that button; without,
 * pass `open`/`onOpenChange` (used by row menus). It closes on success; errors stay in the dialog.
 */
export function ConfirmAction({
  trigger,
  open,
  onOpenChange,
  ...confirm
}: Confirm & { trigger?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = open ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;
  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
          {confirm.description && <AlertDialogDescription>{confirm.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {/* Remounted on every open so an old error does not linger. */}
        {isOpen && (
          <ActionForm action={confirm.action} onSuccess={() => setOpen(false)}>
            {Object.entries(confirm.fields ?? {}).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            {confirm.children}
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">{confirm.cancelLabel ?? "Cancel"}</Button>
              </AlertDialogCancel>
              <SubmitButton variant={confirm.destructive === false ? "default" : "destructive"}>{confirm.confirmLabel}</SubmitButton>
            </AlertDialogFooter>
          </ActionForm>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type RowAction =
  | { label: string; href: string; icon?: React.ReactNode }
  | { label: string; icon?: React.ReactNode; destructive?: boolean; confirm: Confirm };

/** The "…" menu at the end of a table row or phone card. */
export function RowActions({ label, actions }: { label: string; actions: RowAction[] }) {
  const [active, setActive] = useState<Confirm | null>(null);
  if (actions.length === 0) return null;
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={label}>
            <MoreHorizontal aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {actions.map((a, i) => {
            const separator = i > 0 && i === actions.findIndex((x) => "confirm" in x && x.destructive);
            return (
              <div key={a.label}>
                {separator && <DropdownMenuSeparator />}
                {"href" in a ? (
                  <DropdownMenuItem asChild>
                    <Link href={a.href}>
                      {a.icon}
                      {a.label}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem variant={a.destructive ? "destructive" : "default"} onSelect={() => setActive(a.confirm)}>
                    {a.icon}
                    {a.label}
                  </DropdownMenuItem>
                )}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {active && <ConfirmAction {...active} open onOpenChange={(o) => !o && setActive(null)} />}
    </>
  );
}
