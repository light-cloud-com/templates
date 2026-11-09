import { Suspense, useEffect, useState, type ReactNode } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router";
import { FolderKanban, LayoutDashboard, Menu, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { Logo } from "@/components/logo";
import { PageSkeleton } from "@/components/states";
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
    <nav aria-label="App" className="grid gap-0.5">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={onNavigate}
          className={({ isActive }) => cn(
            "text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium",
            isActive && "bg-primary/10 text-primary-text hover:bg-primary/10 hover:text-primary-text",
          )}>
          <Icon className="size-4" aria-hidden /> {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="grid gap-4 p-3 pt-4">
        <div className="px-1.5"><Logo to="/dashboard" /></div>
        <WorkspaceSwitcher onNavigate={onNavigate} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2"><Nav onNavigate={onNavigate} /></div>
      <div className="border-t p-3"><UserMenu /></div>
    </div>
  );
}

function Frame({ sidebar, topBar, children }: { sidebar: ReactNode; topBar: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-svh text-sm">
      <a href="#main" className="skip-link">Skip to content</a>
      <aside className="bg-sidebar fixed inset-y-0 left-0 z-30 hidden w-60 border-r md:block">{sidebar}</aside>
      <header className="bg-background sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-2 md:hidden">{topBar}</header>
      <div className="md:pl-60">
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1120px] px-4 py-6 outline-none sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

/** The shell's outline while the session loads, so the page never flashes to a blank "Loading". */
export function ShellSkeleton() {
  return (
    <Frame
      sidebar={<div className="grid gap-4 p-4"><Logo to="/dashboard" /><Skeleton className="h-12" /><Skeleton className="h-28" /></div>}
      topBar={<div className="px-2"><Logo to="/dashboard" /></div>}
    >
      <PageSkeleton />
    </Frame>
  );
}

/** Signed-in pages: sends visitors to sign in, new users to onboarding, and keeps a workspace active. */
export function RequireAuth({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const { data: session, isPending } = useSession();
  const location = useLocation();
  if (isPending) return fallback;
  if (!session) return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!session.user.onboarded && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  // Workspaces are loaded only once there is a session (no 401 for signed-out visitors).
  return <RequireWorkspace fallback={fallback}>{children}</RequireWorkspace>;
}

function RequireWorkspace({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const activeId = useSession().data?.session.activeOrganizationId;
  const { data: orgs, isPending } = useListOrganizations();
  const { pathname } = useLocation();

  // A new session has no active workspace yet: pick the first one.
  useEffect(() => {
    if (!activeId && orgs?.[0]) void authClient.organization.setActive({ organizationId: orgs[0].id });
  }, [activeId, orgs]);

  if (pathname === "/onboarding" || pathname === "/workspaces/new") return children;
  if (isPending) return fallback;
  if (orgs && orgs.length === 0) return <Navigate to="/workspaces/new" replace />;
  if (!activeId) return fallback;
  return children;
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <Frame
      sidebar={<Sidebar />}
      topBar={
        <>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-sidebar w-72 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Sidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Logo to="/dashboard" />
          <div className="ml-auto"><UserMenu compact /></div>
        </>
      }
    >
      <ErrorBoundary resetKey={pathname}>
        <Suspense fallback={<PageSkeleton />}><Outlet /></Suspense>
      </ErrorBoundary>
    </Frame>
  );
}
