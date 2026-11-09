import { Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function PlanCard({
  plan,
  current,
  highlight,
  badge,
  children,
}: {
  plan: Plan;
  current?: boolean;
  /** Outline in the accent: the recommended or the chosen plan. */
  highlight?: boolean;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col rounded-lg border bg-card p-6", highlight && "border-primary ring-1 ring-primary")}>
      <div className="flex min-h-6 items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{plan.name}</h3>
        {current ? <Badge variant="secondary">Current plan</Badge> : badge && <Badge>{badge}</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
      <p className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">${plan.priceMonthly}</span>
        <span className="text-sm text-muted-foreground">/ month</span>
      </p>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

const SETUP_DOCS = "https://github.com/light-cloud-com/templates/tree/main/starters/saas-starter-nextjs#turn-on-stripe-billing";

/**
 * Shown while Stripe is not configured. Platform admins see what to set; everyone else a neutral line.
 */
export function BillingOffNotice({ admin, className }: { admin?: boolean; className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-lg border bg-surface p-4 text-sm", className)}>
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      {admin ? (
        <p>
          <span className="font-medium">Billing is off (visible to admins only).</span> Set <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code>,{" "}
          <code>STRIPE_PRICE_PRO</code> and <code>STRIPE_PRICE_BUSINESS</code>, then redeploy.{" "}
          <a className="font-medium text-link underline-offset-4 hover:underline" href={SETUP_DOCS} target="_blank" rel="noreferrer">
            How to turn on billing
          </a>
        </p>
      ) : (
        <p>
          <span className="font-medium">Paid plans are not available yet.</span> Everyone is on Free for now.
        </p>
      )}
    </div>
  );
}
