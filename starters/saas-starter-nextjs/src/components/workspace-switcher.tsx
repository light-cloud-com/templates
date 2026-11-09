"use client";

import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { switchWorkspaceAction } from "@/app/(app)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRole } from "@/lib/format";

type Workspace = { id: string; name: string; role?: string };

function Mark({ name }: { name: string }) {
  return (
    <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
      {name.trim()[0]?.toUpperCase() ?? "W"}
    </span>
  );
}

export function WorkspaceSwitcher({ current, workspaces, plan }: { current: Workspace; workspaces: Workspace[]; plan: string }) {
  const [pending, startTransition] = useTransition();
  const pathname = usePathname();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        aria-label={`Workspace: ${current.name}. Switch workspace`}
        className="flex w-full items-center gap-2.5 rounded-lg border bg-background p-2 text-left hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60 data-[state=open]:bg-accent"
      >
        <Mark name={current.name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{current.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{plan} plan</span>
        </span>
        {pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden /> : <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Workspaces</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem
            key={w.id}
            onSelect={() => {
              if (w.id !== current.id) startTransition(() => switchWorkspaceAction(w.id, pathname));
            }}
          >
            <Mark name={w.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{w.name}</span>
              {w.role && <span className="block text-xs text-muted-foreground">{formatRole(w.role)}</span>}
            </span>
            {w.id === current.id && <Check aria-label="Current workspace" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/workspaces/new">
            <Plus aria-hidden /> New workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
