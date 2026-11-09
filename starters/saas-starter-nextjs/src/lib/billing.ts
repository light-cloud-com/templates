import { and, eq, inArray } from "drizzle-orm";
import { billingEnabled } from "./config";
import { db, schema } from "./db";
import type { PlanId } from "./plans";

const LIVE = ["active", "trialing", "past_due"];

/** The workspace's live Stripe subscription, if any. Rows are written by the Stripe webhook. */
export async function activeSubscription(organizationId: string) {
  if (!billingEnabled) return undefined;
  const [sub] = await db
    .select()
    .from(schema.subscription)
    .where(and(eq(schema.subscription.referenceId, organizationId), inArray(schema.subscription.status, LIVE)))
    .limit(1);
  return sub;
}

/** With billing off every workspace is on Free. */
export async function getWorkspacePlan(organizationId: string): Promise<PlanId> {
  const sub = await activeSubscription(organizationId);
  return sub?.plan === "pro" || sub?.plan === "business" ? sub.plan : "free";
}
