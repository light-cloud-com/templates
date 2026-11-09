import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { PlanCards } from "@/components/plan-cards";
import { useSession } from "@/lib/auth-client";
import { useTitle } from "@/lib/title";

export function Pricing() {
  useTitle("Pricing");
  const signedIn = !!useSession().data;
  // The chosen plan rides along: to sign-up (then onboarding), or straight to billing when signed in.
  const target = (plan: string, free: boolean) =>
    signedIn ? (free ? "/dashboard" : `/settings/billing?plan=${plan}`) : (free ? "/sign-up" : `/sign-up?plan=${plan}`);
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Simple pricing</h1>
        <p className="text-muted-foreground mt-3 text-lg">Start free. Upgrade a workspace when your team grows. Prices in US dollars.</p>
      </div>
      <PlanCards
        action={(plan) => (
          <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
            <Link to={target(plan.id, plan.priceMonthly === 0)}>{plan.priceMonthly === 0 ? "Start free" : `Choose ${plan.name}`}</Link>
          </Button>
        )}
      />
      <p className="text-muted-foreground mt-8 text-center text-sm">Every plan includes the REST API and unlimited workspaces. Cancel any time.</p>
    </section>
  );
}
