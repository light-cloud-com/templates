import { cn } from "@/lib/utils";

/** "2 of 3" with a thin accent bar; unlimited (`limit` null) shows the count only. */
export function UsageBar({ used, limit, label, className }: { used: number; limit: number | null; label: string; className?: string }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{limit === null ? `${used}, unlimited` : `${used} of ${limit}`}</span>
      </div>
      {limit !== null && (
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={used}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div className={cn("h-full rounded-full", pct >= 100 ? "bg-warning" : "bg-primary")} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
