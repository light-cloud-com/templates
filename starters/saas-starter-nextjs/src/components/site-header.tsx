import Link from "next/link";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader({ appName, signedIn }: { appName: string; signedIn: boolean }) {
  const actions = signedIn ? (
    <Button asChild size="sm">
      <Link href="/dashboard">Dashboard</Link>
    </Button>
  ) : (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/sign-up">Get started</Link>
      </Button>
    </>
  );
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <Logo name={appName} />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {actions}
        </div>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <MobileNav side="right" title="Site menu">
            <div className="flex h-full flex-col gap-6 p-4 pt-14">
              <nav aria-label="Main" className="flex flex-col">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent">
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 [&>a]:w-full">{actions}</div>
            </div>
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
