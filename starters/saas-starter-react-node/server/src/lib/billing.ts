import Stripe from "stripe";
import { stripe } from "@better-auth/stripe";
import { and, eq, inArray } from "drizzle-orm";
import { config } from "../config.ts";
import { db } from "../db/index.ts";
import * as schema from "../db/schema.ts";
import { getPlan, PLANS, type Plan } from "../../../shared/plans.ts";

const ACTIVE = ["active", "trialing"];

/** The workspace's plan: its active subscription's, or Free. */
export async function getWorkspacePlan(organizationId: string): Promise<Plan & { status: string | null }> {
  if (!config.stripe) return { ...getPlan("free"), status: null };
  const [sub] = await db.select().from(schema.subscription)
    .where(and(eq(schema.subscription.referenceId, organizationId), inArray(schema.subscription.status, ACTIVE)))
    .limit(1);
  return { ...getPlan(sub?.plan), status: sub?.status ?? null };
}

async function roleIn(organizationId: string, userId: string): Promise<string | null> {
  const [m] = await db.select({ role: schema.member.role }).from(schema.member)
    .where(and(eq(schema.member.organizationId, organizationId), eq(schema.member.userId, userId)));
  return m?.role ?? null;
}

// Subscriptions belong to workspaces. Owners manage billing; members may see it.
export const stripePlugin = config.stripe
  ? stripe({
      stripeClient: new Stripe(config.stripe.secretKey),
      stripeWebhookSecret: config.stripe.webhookSecret,
      organization: { enabled: true },
      subscription: {
        enabled: true,
        plans: PLANS.filter((p) => p.id !== "free").map((p) => ({
          name: p.id,
          priceId: config.stripe!.prices[p.id as "pro" | "business"],
          limits: p.limits,
        })),
        authorizeReference: async ({ user, referenceId, action }) => {
          const role = await roleIn(referenceId, user.id);
          if (action === "list-subscription") return role !== null;
          return role === "owner";
        },
      },
    })
  : null;
