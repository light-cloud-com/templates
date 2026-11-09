import { useState } from "react";
import { Link } from "react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";

// Plain anchors: they scroll on the landing page and load it from anywhere else.
const links = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const actions = session
    ? <Button asChild><Link to="/dashboard">Open dashboard</Link></Button>
    : (
      <>
        <Button asChild variant="ghost"><Link to="/sign-in">Sign in</Link></Button>
        <Button asChild><Link to="/sign-up">Get started</Link></Button>
      </>
    );
  return (
    <header className="bg-background sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground text-sm font-medium">{l.label}</a>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {actions}
        </div>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-16 items-center border-b px-4"><Logo /></div>
              <nav aria-label="Main" className="grid gap-1 p-3" onClick={() => setOpen(false)}>
                {links.map((l) => <a key={l.href} href={l.href} className="hover:bg-muted rounded-lg px-3 py-2.5 text-base font-medium">{l.label}</a>)}
              </nav>
              <div className="mt-auto grid gap-2 border-t p-4 *:w-full" onClick={() => setOpen(false)}>{actions}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const footer = [
  { title: "Product", links: [{ href: "/#features", label: "Features" }, { href: "/pricing", label: "Pricing" }, { href: "/#faq", label: "FAQ" }] },
  { title: "Account", links: [{ href: "/sign-in", label: "Sign in" }, { href: "/sign-up", label: "Create an account" }, { href: "/forgot-password", label: "Reset password" }] },
  { title: "Legal", links: [{ href: "/terms", label: "Terms" }, { href: "/privacy", label: "Privacy" }] },
];

export function SiteFooter() {
  const name = useAppConfig().data?.appName ?? "Acme";
  return (
    <footer className="bg-surface border-t">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="grid content-start gap-3">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">Sign-up, teams, billing, an admin panel and an API, ready for your product.</p>
        </div>
        {footer.map((col) => (
          <nav key={col.title} aria-label={col.title} className="grid content-start gap-2.5 text-sm">
            <h2 className="font-semibold">{col.title}</h2>
            {col.links.map((l) => <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground w-fit">{l.label}</a>)}
          </nav>
        ))}
      </div>
      <div className="border-t">
        <p className="text-muted-foreground mx-auto max-w-[1200px] px-4 py-6 text-[0.8125rem] sm:px-6">© {new Date().getFullYear()} {name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
