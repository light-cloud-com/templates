import { Suspense, type ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ErrorBoundary } from "@/components/error-boundary";
import { Logo } from "@/components/logo";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

function Page({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<div className="mx-auto grid max-w-md gap-4 px-4 py-16"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-64" /></div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/** Landing, pricing, legal pages and the 404. */
export function MarketingLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none"><Page><Outlet /></Page></main>
      <SiteFooter />
    </div>
  );
}

/** Sign in, sign up, password reset and invitations: a centred card under the logo. */
export function AuthLayout() {
  return (
    <div className="bg-surface flex min-h-svh flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col items-center px-4 pt-6 pb-16 outline-none sm:pt-12"><Page><Outlet /></Page></main>
      <footer className="text-muted-foreground flex justify-center gap-4 pb-6 text-[0.8125rem]">
        <Link to="/terms" className="hover:text-foreground">Terms</Link>
        <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
      </footer>
    </div>
  );
}

/** One task at a time (onboarding, a new workspace): logo, a way out, and the task. */
export function FocusLayout({ aside, children, wide }: { aside?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <div className="bg-surface flex min-h-svh flex-col text-sm">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Logo to="/dashboard" />
        <div className="flex items-center gap-1">{aside}<ThemeToggle /></div>
      </header>
      <main id="main" tabIndex={-1} className={`mx-auto w-full flex-1 px-4 pt-4 pb-16 outline-none sm:pt-10 ${wide ? "max-w-4xl" : "max-w-xl"}`}>{children}</main>
    </div>
  );
}
