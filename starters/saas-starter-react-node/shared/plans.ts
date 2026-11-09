// The one plans config: the pricing page, limits and Stripe checkout all read from here.
// `null` means unlimited. Prices are display only; Stripe charges what the price ids say.
export type PlanId = "free" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  description: string;
  /** null means unlimited */
  limits: { projects: number | null; members: number | null };
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    description: "For trying it out on your own.",
    limits: { projects: 3, members: 3 },
    features: ["3 projects", "Up to 3 members", "REST API access"],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    description: "For small teams shipping every week.",
    limits: { projects: 50, members: 10 },
    features: ["50 projects", "Up to 10 members", "REST API access", "Email support"],
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 49,
    description: "For growing teams that need room.",
    limits: { projects: null, members: 50 },
    features: ["Unlimited projects", "Up to 50 members", "REST API access", "Priority support"],
  },
];

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0]!;
}

/** True when one more item fits under the plan's limit. */
export function withinLimit(limit: number | null, current: number): boolean {
  return limit === null || current < limit;
}
