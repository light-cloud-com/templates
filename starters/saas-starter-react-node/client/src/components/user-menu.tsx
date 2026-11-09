import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut, Moon, Settings, Shield, Sun } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { authClient, useSession } from "@/lib/auth-client";
import { setTheme, useTheme } from "@/lib/theme";

/** The signed-in person: a full row at the bottom of the sidebar, or just the avatar in the phone top bar. */
export function UserMenu({ compact }: { compact?: boolean }) {
  const user = useSession().data?.user;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  if (!user) return null;

  const signOut = async () => {
    await authClient.signOut();
    queryClient.clear();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
            <UserAvatar name={user.name || user.email} seed={user.id} image={user.image} />
          </Button>
        ) : (
          <button type="button" aria-label="Account menu"
            className="hover:bg-muted focus-visible:ring-ring/50 aria-expanded:bg-muted flex w-full items-center gap-2.5 rounded-lg p-2 text-left outline-none focus-visible:ring-3">
            <UserAvatar name={user.name || user.email} seed={user.id} image={user.image} />
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
            </span>
            <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" aria-hidden />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? "end" : "start"} side={compact ? "bottom" : "top"} className="w-60">
        <DropdownMenuLabel className="grid font-normal">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/settings/account")}><Settings aria-hidden /> Account settings</DropdownMenuItem>
        {user.role === "admin" && <DropdownMenuItem onSelect={() => navigate("/admin")}><Shield aria-hidden /> Admin</DropdownMenuItem>}
        <DropdownMenuItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />} {theme === "dark" ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}><LogOut aria-hidden /> Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
