import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Page not found" };

// Unknown URLs, and pages that refuse to say they exist (/admin for non-admins).
export default async function NotFound() {
  const signedIn = Boolean(await getSession());
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo name={config.appName} />
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-lg border bg-background p-8 text-center">
          <p className="text-sm font-medium text-link">404</p>
          <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The page you are looking for does not exist or was moved.</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild>
              <Link href={signedIn ? "/dashboard" : "/"}>{signedIn ? "Go to dashboard" : "Go to the home page"}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={signedIn ? "/" : "/sign-in"}>{signedIn ? "Home page" : "Sign in"}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
