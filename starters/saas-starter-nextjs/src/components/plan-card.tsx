import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function PlanCard({ plan, current, highlight, children }: { plan: Plan; current?: boolean; highlight?: boolean; children?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col rounded-xl border bg-card p-6", highlight && "border-primary ring-1 ring-primary")}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        {current && <Badge variant="secondary">Current plan</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
      <p className="mt-4">
        <span className="text-4xl font-bold">${plan.priceMonthly}</span>
        <span className="text-muted-foreground"> / month</span>
      </p>
      <ul className="mt-6 flex-1 space-y-2 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="size-4 shrink-0 text-primary" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export function BillingOffNotice() {
  return (
    <p className="text-sm text-muted-foreground">
      Billing is not set up yet, so everyone is on Free. To turn on upgrades, set <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code>, <code>STRIPE_PRICE_PRO</code> and <code>STRIPE_PRICE_BUSINESS</code>.
    </p>
  );
}
