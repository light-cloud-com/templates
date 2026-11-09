import { useSearchParams } from "react-router";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlanButton, PlanCards } from "@/components/plan-cards";
import { authClient } from "@/lib/auth-client";
import { README_BILLING_URL } from "@/lib/links";
import { useActiveWorkspaceId, useAppConfig, useCan, useShowSetupHints, useWorkspace } from "@/lib/queries";
import { Section } from "./section";

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface flex items-start gap-2.5 rounded-xl border p-4 text-sm">
      <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

export function BillingSettings() {
  const billingEnabled = useAppConfig().data?.billingEnabled;
  const ws = useWorkspace().data;
  const referenceId = useActiveWorkspaceId() ?? undefined;
  const isOwner = useCan({ billing: ["manage"] });
  const hints = useShowSetupHints();
  const selected = useSearchParams()[0].get("plan");
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

  const canChange = !!billingEnabled && isOwner;
  return (
    <>
      {!billingEnabled && (hints ? (
        <Note>
          <p className="font-medium">Billing is not set up on this deployment yet</p>
          <p className="text-muted-foreground">
            Everyone is on Free until you set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO and STRIPE_PRICE_BUSINESS and redeploy.
            Only platform admins see this. <a href={README_BILLING_URL} target="_blank" rel="noreferrer" className="text-primary-text font-medium underline underline-offset-2">How to turn on billing</a>
          </p>
        </Note>
      ) : (
        <Note>
          <p className="font-medium">Paid plans are not available yet</p>
          <p className="text-muted-foreground">Every workspace is on the Free plan for now.</p>
        </Note>
      ))}
      {billingEnabled && !isOwner && <Note><p>Only the workspace owner can change the plan.</p></Note>}
      <PlanCards
        current={current}
        selected={selected}
        action={(plan) => {
          if (plan.id === current) {
            return current !== "free" && canChange
              ? <PlanButton variant="outline" onClick={portal}>Manage subscription</PlanButton>
              : <PlanButton variant="outline" disabled>Current plan</PlanButton>;
          }
          if (plan.id === "free") return <PlanButton variant="outline" disabled={!canChange} onClick={portal}>Downgrade in portal</PlanButton>;
          return (
            <PlanButton variant={(selected ? selected === plan.id : plan.highlighted) ? "default" : "outline"} disabled={!canChange} onClick={() => upgrade(plan.id)}>
              Upgrade to {plan.name}
            </PlanButton>
          );
        }}
      />
      {canChange && current !== "free" && (
        <Section title="Invoices and payment method" description="Stripe's customer portal has your invoices, card and cancellation.">
          <Button variant="outline" onClick={portal}>Open billing portal</Button>
        </Section>
      )}
    </>
  );
}
