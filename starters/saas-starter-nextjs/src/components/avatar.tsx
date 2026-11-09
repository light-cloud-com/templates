import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Muted tints, one per person (by a hash of their name or email), so lists are easy to scan.
const palette = [
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
];

function hash(value: string) {
  let h = 0;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function Avatar({ name, seed, className }: { name: string; seed?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        palette[hash(seed ?? name) % palette.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
