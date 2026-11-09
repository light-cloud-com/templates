import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { PlanCards } from "@/components/plan-cards";

export function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Simple pricing</h1>
        <p className="text-muted-foreground mt-3">Start free. Upgrade a workspace when your team grows.</p>
      </div>
      <PlanCards
        action={(plan) => (
          <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
            <Link to="/sign-up">{plan.priceMonthly === 0 ? "Start free" : `Choose ${plan.name}`}</Link>
          </Button>
        )}
      />
    </section>
  );
}
