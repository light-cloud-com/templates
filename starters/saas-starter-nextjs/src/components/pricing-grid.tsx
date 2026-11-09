import Link from "next/link";
import { BillingOffNotice, PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { billingEnabled } from "@/lib/config";
import { plans } from "@/lib/plans";

/**
 * The three plans for the public pages. "Choose Pro" carries the plan to sign-up (?plan=pro), which
 * carries it through onboarding to checkout; signed-in visitors go to Billing with the plan picked.
 * While billing is off the paid plans say so instead of leading to a dead end.
 */
export function PricingGrid({ signedIn, admin }: { signedIn: boolean; admin?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const recommended = plan.id === "pro";
          const href =
            plan.id === "free"
              ? signedIn ? "/dashboard" : "/sign-up"
              : signedIn ? `/settings/billing?plan=${plan.id}` : `/sign-up?plan=${plan.id}`;
          const enabled = plan.id === "free" || billingEnabled;
          return (
            <PlanCard key={plan.id} plan={plan} highlight={recommended} badge={recommended ? "Recommended" : undefined}>
              {enabled ? (
                <Button asChild className="w-full" variant={recommended ? "default" : "outline"}>
                  <Link href={href}>{plan.id === "free" ? (signedIn ? "Go to dashboard" : "Start for free") : `Choose ${plan.name}`}</Link>
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  Coming soon
                </Button>
              )}
            </PlanCard>
          );
        })}
      </div>
      {!billingEnabled && <BillingOffNotice admin={admin} className="mx-auto max-w-2xl" />}
    </div>
  );
}
