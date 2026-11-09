import type { ReactNode } from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Nothing here yet: icon, one line, one line, one action. */
export function EmptyState({ icon: Icon, title, description, action, className }: { icon: LucideIcon; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-xl border px-6 py-12 text-center", className)}>
      <span className="bg-muted text-muted-foreground mb-4 flex size-10 items-center justify-center rounded-full">
        <Icon className="size-5" aria-hidden />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** A request failed: say so, and offer to try again. */
export function ErrorState({ title = "Could not load this", error, onRetry, className }: { title?: string; error?: unknown; onRetry?: () => void; className?: string }) {
  const message = error instanceof Error && error.message ? error.message : "Something went wrong.";
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-xl border px-6 py-12 text-center", className)}>
      <span className="bg-destructive/10 text-destructive mb-4 flex size-10 items-center justify-center rounded-full">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{message.endsWith(".") ? message : `${message}.`} Check your connection and try again.</p>
      {onRetry && <Button variant="outline" className="mt-5" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

/** Placeholder rows while a list loads. */
export function ListSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading" className={cn("divide-y rounded-xl border", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="size-8 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder for a whole page: header plus a few blocks. Used while a route's code loads. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="grid gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-56" />
    </div>
  );
}
