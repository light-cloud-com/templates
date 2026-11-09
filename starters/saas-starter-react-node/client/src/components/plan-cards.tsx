import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PLANS, type Plan, type PlanId } from "@shared/plans.ts";

interface Props {
  current?: PlanId;
  /** Renders the button for each plan; omit for a plain price list. */
  action?: (plan: Plan) => React.ReactNode;
}

export function PlanCards({ current, action }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PLANS.map((plan) => (
        <Card key={plan.id} className={cn("flex flex-col", plan.highlighted && "border-primary shadow-md")}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              {current === plan.id ? <Badge variant="secondary">Current plan</Badge> : plan.highlighted && <Badge>Popular</Badge>}
            </div>
            <CardDescription>{plan.description}</CardDescription>
            <p className="pt-2">
              <span className="text-3xl font-semibold">${plan.priceMonthly}</span>
              <span className="text-muted-foreground text-sm"> / month</span>
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="grid gap-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="text-primary size-4 shrink-0" aria-hidden /> {f}
                </li>
              ))}
            </ul>
          </CardContent>
          {action && <CardFooter>{action(plan)}</CardFooter>}
        </Card>
      ))}
    </div>
  );
}

export function PlanButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return <Button className="w-full" {...props}>{children}</Button>;
}
