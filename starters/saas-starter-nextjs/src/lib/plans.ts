// The one plans config: the pricing page, limits and Stripe checkout all read from here.
// `null` means unlimited. Prices are display only; Stripe charges what the price ids say.
export type PlanId = "free" | "pro" | "business";
export type LimitedResource = "projects" | "members";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number;
  description: string;
  limits: Record<LimitedResource, number | null>;
  features: string[];
};

export const plans: Plan[] = [
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
  return plans.find((p) => p.id === id) ?? plans[0];
}

/** True when one more `resource` fits in the plan, given how many there are now. */
export function withinLimit(planId: string | null | undefined, resource: LimitedResource, current: number) {
  const limit = getPlan(planId).limits[resource];
  return limit === null || current < limit;
}

export class PlanLimitError extends Error {
  constructor(public resource: LimitedResource, public planId: PlanId) {
    const limit = getPlan(planId).limits[resource];
    super(`The ${getPlan(planId).name} plan allows ${limit} ${resource}. Upgrade to add more.`);
  }
}
