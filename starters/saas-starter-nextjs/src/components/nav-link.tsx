"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const styles = {
  // Sidebar item: accent tint when active.
  sidebar:
    "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:text-link [&_svg]:size-4",
  // Underlined tab (settings, admin).
  tab: "relative flex h-10 shrink-0 items-center px-1 text-sm font-medium text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:-bottom-px aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-primary",
};

export function NavLink({
  href,
  children,
  variant = "sidebar",
  exact,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof styles;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(styles[variant], "rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none", variant === "sidebar" && "rounded-lg")}
    >
      {children}
    </Link>
  );
}
