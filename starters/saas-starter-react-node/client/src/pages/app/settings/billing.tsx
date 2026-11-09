import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PlanButton, PlanCards } from "@/components/plan-cards";
import { authClient } from "@/lib/auth-client";
import { useActiveWorkspaceId, useAppConfig, useCan, useWorkspace } from "@/lib/queries";
import { Section } from "./section";

export function BillingSettings() {
  const billingEnabled = useAppConfig().data?.billingEnabled;
  const ws = useWorkspace().data;
  const referenceId = useActiveWorkspaceId() ?? undefined;
  const isOwner = useCan({ billing: ["manage"] });
  const current = ws?.plan ?? "free";

  async function upgrade(plan: string) {
    const { error } = await authClient.subscription.upgrade({
      plan, referenceId, customerType: "organization",
      successUrl: "/dashboard?upgraded=1", cancelUrl: "/settings/billing", returnUrl: "/settings/billing",
    });
    if (error) toast.error(error.message ?? "Could not start checkout");
  }

  async function portal() {
    const { error } = await authClient.subscription.billingPortal({ referenceId, customerType: "organization", returnUrl: "/settings/billing" });
    if (error) toast.error(error.message ?? "Could not open the billing portal");
  }

  return (
    <>
      {!billingEnabled && (
        <Alert>
          <AlertTitle>Billing is not set up on this deployment yet</AlertTitle>
          <AlertDescription>
            Everyone is on Free for now. To take payments, set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO and STRIPE_PRICE_BUSINESS and redeploy. The README walks through it.
          </AlertDescription>
        </Alert>
      )}
      {billingEnabled && !isOwner && (
        <Alert><AlertDescription>Only the workspace owner can change the plan.</AlertDescription></Alert>
      )}
      <PlanCards
        current={current}
        action={(plan) => {
          if (plan.id === current) {
            return current !== "free" && billingEnabled && isOwner
              ? <PlanButton variant="outline" onClick={portal}>Manage subscription</PlanButton>
              : <PlanButton variant="outline" disabled>Current plan</PlanButton>;
          }
          if (plan.id === "free") {
            return <PlanButton variant="outline" disabled={!billingEnabled || !isOwner} onClick={portal}>Downgrade in portal</PlanButton>;
          }
          return (
            <PlanButton variant={plan.highlighted ? "default" : "outline"} disabled={billingEnabled && !isOwner}
              onClick={() => (billingEnabled ? upgrade(plan.id) : toast.info("Billing is not set up yet. Add your Stripe keys to turn it on."))}>
              Upgrade to {plan.name}
            </PlanButton>
          );
        }}
      />
      {billingEnabled && isOwner && current !== "free" && (
        <Section title="Invoices and payment method">
          <Button variant="outline" onClick={portal}>Open billing portal</Button>
        </Section>
      )}
    </>
  );
}
