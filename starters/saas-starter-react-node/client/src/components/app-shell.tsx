import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router";
import { FolderKanban, LayoutDashboard, Menu, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { Spinner } from "@/components/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { authClient, useListOrganizations, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const isAdmin = useSession().data?.user.role === "admin";
  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/settings", label: "Settings", icon: Settings },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];
  return (
    <nav aria-label="App" className="grid gap-1">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn("text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              isActive && "bg-muted text-foreground font-medium")}
        >
          <Icon className="size-4" aria-hidden /> {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo to="/dashboard" />
      <WorkspaceSwitcher />
      <Nav onNavigate={onNavigate} />
    </div>
  );
}

/** Signed-in pages: sends visitors to sign in, new users to onboarding, and keeps a workspace active. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const { data: orgs, isPending: orgsPending } = useListOrganizations();
  const location = useLocation();
  const activeId = session?.session.activeOrganizationId;

  // A new session has no active workspace yet: pick the first one.
  useEffect(() => {
    if (session && !activeId && orgs?.[0]) void authClient.organization.setActive({ organizationId: orgs[0].id });
  }, [session, activeId, orgs]);

  if (isPending) return <Spinner />;
  if (!session) return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!session.user.onboarded && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  if (location.pathname === "/onboarding" || location.pathname === "/workspaces/new") return children;
  if (orgsPending) return <Spinner />;
  if (orgs && orgs.length === 0) return <Navigate to="/workspaces/new" replace />;
  if (!activeId) return <Spinner />;
  return children;
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-svh">
      <aside className="bg-sidebar hidden w-64 shrink-0 border-r md:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Sidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
