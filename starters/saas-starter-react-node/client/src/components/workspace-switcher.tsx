import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient, useListOrganizations, useSession } from "@/lib/auth-client";

export function WorkspaceSwitcher() {
  const { data: orgs } = useListOrganizations();
  const activeId = useSession().data?.session.activeOrganizationId;
  const active = orgs?.find((o) => o.id === activeId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const switchTo = async (organizationId: string) => {
    await authClient.organization.setActive({ organizationId });
    await queryClient.invalidateQueries();
    navigate("/dashboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" aria-label="Switch workspace">
          <span className="truncate">{active?.name ?? "Choose a workspace"}</span>
          <ChevronsUpDown className="opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {orgs?.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => switchTo(o.id)}>
            <span className="flex-1 truncate">{o.name}</span>
            {o.id === activeId && <Check aria-label="Current" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/workspaces/new")}>
          <Plus aria-hidden /> Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
