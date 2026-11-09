import type { Metadata } from "next";
import { ActionForm, SubmitButton } from "@/components/form";
import { BillingOffNotice, PlanCard } from "@/components/plan-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { activeSubscription } from "@/lib/billing";
import { billingEnabled } from "@/lib/config";
import { can } from "@/lib/permissions";
import { getPlan, plans } from "@/lib/plans";
import { requireWorkspace } from "@/lib/session";
import { manageBillingAction, upgradeAction } from "./actions";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage({ searchParams }: PageProps<"/settings/billing">) {
  const { workspace, role, plan } = await requireWorkspace();
  const { upgraded } = await searchParams;
  const owner = can(role, "billing:manage");
  const subscription = await activeSubscription(workspace.id);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><h1>Billing</h1></CardTitle>
          <CardDescription>
            {workspace.name} is on the {getPlan(plan).name} plan.
            {subscription?.cancelAtPeriodEnd && subscription.periodEnd && ` It ends on ${subscription.periodEnd.toLocaleDateString("en")}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upgraded && <p role="status" className="text-sm">Thanks! Your plan updates as soon as Stripe confirms the payment.</p>}
          {!billingEnabled && <BillingOffNotice />}
          {billingEnabled && !owner && <p className="text-sm text-muted-foreground">Only workspace owners can change the plan.</p>}
          {billingEnabled && owner && subscription && (
            <ActionForm action={manageBillingAction}>
              <SubmitButton variant="outline">Manage billing in Stripe</SubmitButton>
            </ActionForm>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} current={p.id === plan}>
            {p.id !== "free" && p.id !== plan && !subscription && (
              <ActionForm action={upgradeAction} className="space-y-2">
                <input type="hidden" name="plan" value={p.id} />
                <SubmitButton className="w-full" disabled={!billingEnabled || !owner}>Upgrade to {p.name}</SubmitButton>
              </ActionForm>
            )}
          </PlanCard>
        ))}
      </div>
    </>
  );
}
