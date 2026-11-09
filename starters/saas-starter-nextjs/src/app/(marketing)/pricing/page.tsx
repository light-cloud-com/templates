import type { Metadata } from "next";
import Link from "next/link";
import { BillingOffNotice, PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { billingEnabled } from "@/lib/config";
import { plans } from "@/lib/plans";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Pricing", description: "Simple monthly plans: Free, Pro and Business." };

export default async function PricingPage() {
  const signedIn = Boolean(await getSession());
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when your team grows.</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} highlight={plan.id === "pro"}>
            <Button asChild className="w-full" variant={plan.id === "pro" ? "default" : "outline"}>
              <Link href={signedIn ? "/settings/billing" : "/sign-up"}>
                {plan.id === "free" ? "Start for free" : `Choose ${plan.name}`}
              </Link>
            </Button>
          </PlanCard>
        ))}
      </div>
      {!billingEnabled && (
        <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-dashed p-4 text-center">
          <BillingOffNotice />
        </div>
      )}
    </div>
  );
}
