import { useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Confirm } from "@/components/confirm";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hidden on the phone card (e.g. already shown in the card's title). */
  hideOnCard?: boolean;
}

export interface RowAction {
  label: string;
  onSelect: () => unknown | Promise<unknown>;
  destructive?: boolean;
  /** Ask first in a dialog; onSelect runs on confirm and may throw to show an error there. */
  confirm?: { title: string; description: ReactNode; action: string };
}

interface Props<T> {
  rows: T[];
  rowKey: (row: T) => string;
  columns: Column<T>[];
  /** The card's heading on phones; usually the same cell as the first column. */
  primary: (row: T) => ReactNode;
  /** Names the row for screen readers ("Actions for …"). */
  name: (row: T) => string;
  actions?: (row: T) => RowAction[];
  label: string;
  empty?: ReactNode;
  /** Cards at every width, for narrow containers such as the onboarding card. */
  stacked?: boolean;
}

/** A flat table on wider screens; stacked cards with a "…" menu below `sm`. */
export function DataTable<T>({ rows, rowKey, columns, primary, name, actions, label, empty, stacked }: Props<T>) {
  const [pending, setPending] = useState<RowAction | null>(null);

  const run = (action: RowAction) => (action.confirm ? setPending(action) : void action.onSelect());
  const menu = (row: T) => {
    const items = actions?.(row) ?? [];
    if (items.length === 0) return null;
    return (
      // Not modal: a confirm dialog opens right after the menu closes.
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name(row)}`}><MoreHorizontal aria-hidden /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {items.map((a) => (
            <DropdownMenuItem key={a.label} variant={a.destructive ? "destructive" : "default"} onSelect={() => run(a)}>{a.label}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <>
      <div className={stacked ? "hidden" : "hidden overflow-hidden rounded-xl border sm:block"}>
        <Table aria-label={label}>
          <TableHeader>
            <TableRow>
              {columns.map((c) => <TableHead key={c.header} className={c.className}>{c.header}</TableHead>)}
              {actions && <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((c) => <TableCell key={c.header} className={c.className}>{c.cell(row)}</TableCell>)}
                {actions && <TableCell className="text-right">{menu(row)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul aria-label={label} className={stacked ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-3 sm:hidden"}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">{primary(row)}</div>
              {actions && <div className="-mt-1 -mr-1">{menu(row)}</div>}
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              {columns.filter((c) => !c.hideOnCard).map((c) => (
                <div key={c.header} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{c.header}</dt>
                  <dd className="min-w-0 text-right">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {pending?.confirm && (
        <Confirm
          open
          onOpenChange={(o) => !o && setPending(null)}
          title={pending.confirm.title}
          description={pending.confirm.description}
          action={pending.confirm.action}
          destructive={pending.destructive}
          onConfirm={pending.onSelect}
        />
      )}
    </>
  );
}
