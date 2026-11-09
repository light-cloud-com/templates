import { FolderKanban, LayoutDashboard, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { config } from "@/lib/config";
import { getPlan } from "@/lib/plans";
import { isPlatformAdmin, listWorkspaces, requireUser, requireWorkspace } from "@/lib/session";
import { stopImpersonatingAction } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  if (!user.onboardingCompleted) redirect("/onboarding");
  const { workspace, session, role, plan } = await requireWorkspace();
  const workspaces = await listWorkspaces(user.id);

  // The same sidebar is the fixed column on desktop and the sheet behind the menu button on phone.
  const sidebar = (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="px-1 pt-1">
        <Logo name={config.appName} href="/dashboard" />
      </div>
      <WorkspaceSwitcher current={{ ...workspace, role }} workspaces={workspaces} plan={getPlan(plan).name} />
      <nav aria-label="App" className="flex flex-col gap-0.5">
        <NavLink href="/dashboard"><LayoutDashboard aria-hidden /> Dashboard</NavLink>
        <NavLink href="/projects"><FolderKanban aria-hidden /> Projects</NavLink>
        <NavLink href="/settings"><Settings aria-hidden /> Settings</NavLink>
      </nav>
      <div className="mt-auto border-t pt-3">
        <UserMenu name={user.name} email={user.email} isAdmin={isPlatformAdmin(user)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh text-sm md:pl-60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-surface md:block">{sidebar}</aside>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-2 md:hidden">
        <MobileNav title="App menu">{sidebar}</MobileNav>
        <Logo name={config.appName} href="/dashboard" />
        <span className="ml-auto max-w-[40%] truncate pr-2 text-xs text-muted-foreground">{workspace.name}</span>
      </header>
      {session.impersonatedBy && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-sm sm:px-6">
          <span>You are signed in as <strong>{user.email}</strong> (admin impersonation).</span>
          <form action={stopImpersonatingAction}>
            <Button type="submit" size="sm" variant="outline">Stop impersonating</Button>
          </form>
        </div>
      )}
      <main id="main" className="mx-auto w-full max-w-[1120px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
