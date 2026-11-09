import { FolderKanban, LayoutDashboard, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { config } from "@/lib/config";
import { isPlatformAdmin, listWorkspaces, requireUser, requireWorkspace } from "@/lib/session";
import { stopImpersonatingAction } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  if (!user.onboardingCompleted) redirect("/onboarding");
  const { workspace, session } = await requireWorkspace();
  const workspaces = await listWorkspaces(user.id);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="border-b bg-muted/30 md:sticky md:top-0 md:flex md:h-dvh md:w-64 md:shrink-0 md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-2 p-4">
          <Logo name={config.appName} href="/dashboard" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu name={user.name} email={user.email} isAdmin={isPlatformAdmin(user)} />
          </div>
        </div>
        <div className="px-4 pb-2">
          <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
        </div>
        <nav aria-label="App" className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pt-2">
          <NavLink href="/dashboard"><LayoutDashboard className="size-4" aria-hidden /> Dashboard</NavLink>
          <NavLink href="/projects"><FolderKanban className="size-4" aria-hidden /> Projects</NavLink>
          <NavLink href="/settings"><Settings className="size-4" aria-hidden /> Settings</NavLink>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {session.impersonatedBy && (
          <div role="status" className="flex flex-wrap items-center justify-between gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground">
            <span>You are signed in as {user.email} (admin impersonation).</span>
            <form action={stopImpersonatingAction}>
              <Button type="submit" size="sm" variant="secondary">Stop impersonating</Button>
            </form>
          </div>
        )}
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 space-y-8 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
