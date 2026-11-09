import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { isPlatformAdmin, requireUser } from "@/lib/session";

// Platform admins only. Everyone else gets a plain 404, so the page does not advertise itself (the
// title too: see generateMetadata in page.tsx).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  if (!isPlatformAdmin(user)) notFound();
  // Someone added to ADMIN_EMAILS after signing up gets the admin role Better Auth's admin endpoints check.
  if (user.role !== "admin") await db.update(schema.user).set({ role: "admin" }).where(eq(schema.user.id, user.id));
  return (
    <div className="min-h-dvh text-sm">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo name={config.appName} href="/dashboard" />
            <Badge>Admin</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard"><ArrowLeft aria-hidden /> <span className="max-sm:sr-only">Back to app</span></Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1120px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
