"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionState, runAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { billingEnabled } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { assertCan } from "@/lib/permissions";
import { requireUser, requireWorkspace } from "@/lib/session";
import { baseUrl } from "@/lib/url";

/** Sends an owner to Stripe Checkout for the chosen plan. The webhook records the subscription. */
export async function upgradeAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    if (!billingEnabled) return { error: "Billing is not set up yet." };
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "billing:manage");
    const plan = z.enum(["pro", "business"]).parse(form.get("plan"));
    const h = await headers();
    if (form.get("from") === "onboarding") {
      const { user } = await requireUser();
      await db.update(schema.user).set({ onboardingCompleted: true }).where(eq(schema.user.id, user.id));
    }
    const origin = baseUrl(h);
    const res = await auth.api.upgradeSubscription({
      body: {
        plan,
        referenceId: ctx.workspace.id,
        customerType: "organization",
        successUrl: `${origin}/settings/billing?upgraded=1`,
        cancelUrl: `${origin}/settings/billing`,
        disableRedirect: true,
      },
      headers: h,
    });
    if (!res.url) return { error: "Stripe did not return a checkout link. Try again." };
    redirect(res.url);
  });
}

/** Opens the Stripe customer portal to change plan, card or cancel. */
export async function manageBillingAction(): Promise<ActionState> {
  return runAction(async () => {
    if (!billingEnabled) return { error: "Billing is not set up yet." };
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "billing:manage");
    const h = await headers();
    const res = await auth.api.createBillingPortal({
      body: { referenceId: ctx.workspace.id, customerType: "organization", returnUrl: `${baseUrl(h)}/settings/billing`, disableRedirect: true },
      headers: h,
    });
    redirect(res.url);
  });
}
