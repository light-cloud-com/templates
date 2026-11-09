import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A titled block of settings: flat card, heading row, content. */
export function Section({ title, description, children, danger, action }: { title: string; description?: ReactNode; children?: ReactNode; danger?: boolean; action?: ReactNode }) {
  return (
    <section className={cn("bg-card rounded-xl border", danger && "border-destructive/40")}>
      <div className={cn("flex flex-wrap items-start justify-between gap-3 p-4 sm:p-6", children && "pb-0 sm:pb-0")}>
        <div className="min-w-0">
          <h2 className={cn("text-base font-semibold", danger && "text-destructive")}>{title}</h2>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
        {action}
      </div>
      {children && <div className="px-4 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-6">{children}</div>}
    </section>
  );
}
