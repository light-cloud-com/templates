import type { ComponentProps, ReactNode } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLANS, type Plan, type PlanId } from "@shared/plans.ts";

interface Props {
  current?: PlanId;
  /** A plan asked for in the URL (?plan=pro): outlined as the one being chosen. */
  selected?: string | null;
  /** Renders the button for each plan; omit for a plain price list. */
  action?: (plan: Plan) => ReactNode;
  compact?: boolean;
}

export function PlanCards({ current, selected, action, compact }: Props) {
  const outlined = (plan: Plan) => (selected ? selected === plan.id : plan.highlighted);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PLANS.map((plan) => (
        <div key={plan.id}
          className={cn("bg-card flex flex-col rounded-xl border p-6", outlined(plan) && "border-primary ring-primary ring-1")}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold">{plan.name}</h3>
            {current === plan.id
              ? <Badge variant="secondary">Current plan</Badge>
              : plan.highlighted && <Badge className="bg-primary/10 text-primary-text">Most popular</Badge>}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
          <p className="mt-5 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight">${plan.priceMonthly}</span>
            <span className="text-muted-foreground text-sm">per month</span>
          </p>
          {action && <div className="mt-5">{action(plan)}</div>}
          {!compact && (
            <ul className="mt-6 grid gap-2.5 border-t pt-6 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="text-primary-text size-4 shrink-0" aria-hidden /> {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export function PlanButton({ children, ...props }: ComponentProps<typeof Button>) {
  return <Button className="w-full" {...props}>{children}</Button>;
}
