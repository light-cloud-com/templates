import Link from "next/link";
import { Logo } from "@/components/logo";

const columns = [
  { title: "Product", links: [{ href: "/#features", label: "Features" }, { href: "/pricing", label: "Pricing" }, { href: "/#faq", label: "FAQ" }] },
  { title: "Account", links: [{ href: "/sign-in", label: "Sign in" }, { href: "/sign-up", label: "Create an account" }, { href: "/forgot-password", label: "Reset password" }] },
  { title: "Legal", links: [{ href: "/terms", label: "Terms of service" }, { href: "/privacy", label: "Privacy policy" }] },
];

export function SiteFooter({ appName }: { appName: string }) {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo name={appName} />
          <p className="max-w-xs text-sm text-muted-foreground">Accounts, teams, billing and an API, ready to build your product on.</p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title} className="space-y-3 text-sm">
            <h2 className="font-medium">{c.title}</h2>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link className="text-muted-foreground hover:text-foreground" href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-[1200px] px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
