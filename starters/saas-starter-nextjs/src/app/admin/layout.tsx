import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { config } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { isPlatformAdmin, requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// Platform admins only. Everyone else gets a plain 404, so the page does not advertise itself.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  if (!isPlatformAdmin(user)) notFound();
  // Someone added to ADMIN_EMAILS after signing up gets the admin role Better Auth's admin endpoints check.
  if (user.role !== "admin") await db.update(schema.user).set({ role: "admin" }).where(eq(schema.user.id, user.id));
  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3">
            <Logo name={config.appName} href="/dashboard" />
            <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-primary underline-offset-4 hover:underline">Back to app</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl space-y-6 px-4 py-8">{children}</main>
    </div>
  );
}
