import { Layers } from "lucide-react";
import Link from "next/link";

export function Logo({ name, href = "/" }: { name: string; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-md font-semibold focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Layers className="size-4" aria-hidden />
      </span>
      {name}
    </Link>
  );
}
