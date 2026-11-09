import { cn } from "@/lib/utils";

/** The phone layout of a table: rows as stacked cards. Shown below `sm`; the table above it. */
export function CardList({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <ul aria-label={label} className={cn("divide-y rounded-lg border sm:hidden", className)}>
      {children}
    </ul>
  );
}

export function CardListItem({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 p-4">
      <div className="min-w-0 flex-1">{children}</div>
      {actions && <div className="-mt-1 -mr-2 shrink-0">{actions}</div>}
    </li>
  );
}
