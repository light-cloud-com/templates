import type { Metadata } from "next";
import { PricingGrid } from "@/components/pricing-grid";
import { getSession, isPlatformAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Pricing", description: "Simple monthly plans: Free, Pro and Business." };

export default async function PricingPage() {
  const session = await getSession();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when your team grows. Cancel any time.</p>
      </div>
      <div className="mt-12">
        <PricingGrid signedIn={Boolean(session)} admin={session ? isPlatformAdmin(session.user) : false} />
      </div>
    </div>
  );
}
