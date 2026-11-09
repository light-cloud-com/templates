import { Link, NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { data: session } = useSession();
  const link = ({ isActive }: { isActive: boolean }) =>
    cn("text-sm text-muted-foreground hover:text-foreground", isActive && "text-foreground font-medium");
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label="Main" className="hidden gap-5 sm:flex">
            <NavLink to="/pricing" className={link}>Pricing</NavLink>
            <a href="/#faq" className="text-muted-foreground hover:text-foreground text-sm">FAQ</a>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {session ? (
            <Button asChild size="sm"><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/sign-in">Sign in</Link></Button>
              <Button asChild size="sm"><Link to="/sign-up">Get started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm">
        <p>© {new Date().getFullYear()} Acme. All rights reserved.</p>
        <nav aria-label="Legal" className="flex gap-4">
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
