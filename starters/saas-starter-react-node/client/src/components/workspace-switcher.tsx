import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { authClient, useListOrganizations, useSession } from "@/lib/auth-client";
import { getPlan } from "@shared/plans.ts";
import { useWorkspace } from "@/lib/queries";

export function WorkspaceSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { data: orgs } = useListOrganizations();
  const activeId = useSession().data?.session.activeOrganizationId;
  const active = orgs?.find((o) => o.id === activeId);
  const plan = useWorkspace().data?.plan;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const switchTo = async (organizationId: string, name: string) => {
    const { error } = await authClient.organization.setActive({ organizationId });
    if (error) return toast.error(error.message ?? "Could not switch workspace");
    await queryClient.invalidateQueries();
    // Stay in the same section; a single project belongs to the old workspace.
    if (pathname.startsWith("/projects/")) navigate("/projects");
    onNavigate?.();
    toast.success(`Switched to ${name}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Switch workspace"
          className="bg-background hover:bg-muted focus-visible:ring-ring/50 aria-expanded:bg-muted flex w-full items-center gap-2.5 rounded-lg border p-2 text-left outline-none focus-visible:ring-3">
          <UserAvatar square name={active?.name ?? "?"} seed={active?.id} className="size-7" />
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-sm font-medium">{active?.name ?? "Choose a workspace"}</span>
            {plan && <span className="text-muted-foreground text-xs">{getPlan(plan).name} plan</span>}
          </span>
          <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Workspaces</DropdownMenuLabel>
        {orgs?.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => o.id !== activeId && switchTo(o.id, o.name)}>
            <UserAvatar square name={o.name} seed={o.id} className="size-5 text-[0.625rem]" />
            <span className="flex-1 truncate">{o.name}</span>
            {o.id === activeId && <Check aria-label="Current workspace" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { onNavigate?.(); navigate("/workspaces/new"); }}>
          <Plus aria-hidden /> Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
