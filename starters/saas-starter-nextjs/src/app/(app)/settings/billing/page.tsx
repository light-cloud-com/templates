import { count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { ActionForm, SubmitButton } from "@/components/form";
import { BillingOffNotice, PlanCard } from "@/components/plan-card";
import { UsageBar } from "@/components/usage-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { activeSubscription } from "@/lib/billing";
import { billingEnabled } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { getPlan, plans } from "@/lib/plans";
import { countProjects } from "@/lib/projects";
import { isPlatformAdmin, requireWorkspace } from "@/lib/session";
import { manageBillingAction, upgradeAction } from "./actions";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage({ searchParams }: PageProps<"/settings/billing">) {
  const { workspace, role, plan, user } = await requireWorkspace();
  const { upgraded, plan: wanted } = await searchParams;
  const owner = can(role, "billing:manage");
  const [subscription, projects, [{ members }]] = await Promise.all([
    activeSubscription(workspace.id),
    countProjects(workspace.id),
    db.select({ members: count() }).from(schema.member).where(eq(schema.member.organizationId, workspace.id)),
  ]);
  const current = getPlan(plan);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><h2>Current plan: {current.name}</h2></CardTitle>
          <CardDescription>
            {current.priceMonthly ? `$${current.priceMonthly} a month.` : "Free, no card needed."}
            {subscription?.cancelAtPeriodEnd && subscription.periodEnd && ` Ends on ${formatDate(subscription.periodEnd)}.`}
            {subscription && !subscription.cancelAtPeriodEnd && subscription.periodEnd && ` Renews on ${formatDate(subscription.periodEnd)}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upgraded && <p role="status" className="rounded-lg border border-success/30 bg-success/10 px-3 py-2">Thanks! Your plan updates as soon as Stripe confirms the payment.</p>}
          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            <UsageBar used={projects} limit={current.limits.projects} label="Projects" />
            <UsageBar used={members} limit={current.limits.members} label="Members" />
          </div>
          {!billingEnabled && <BillingOffNotice admin={isPlatformAdmin(user)} />}
          {billingEnabled && !owner && <p className="text-muted-foreground">Only workspace owners can change the plan.</p>}
          {billingEnabled && owner && subscription && (
            <ActionForm action={manageBillingAction}>
              <SubmitButton variant="outline">Manage billing in Stripe</SubmitButton>
            </ActionForm>
          )}
        </CardContent>
      </Card>
      <section aria-labelledby="plans-title" className="space-y-3">
        <h2 id="plans-title" className="text-base font-semibold">Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} current={p.id === plan} highlight={wanted === p.id && p.id !== plan}>
              {p.id !== "free" && p.id !== plan && !subscription &&
                (billingEnabled && owner ? (
                  <ActionForm action={upgradeAction} className="space-y-2">
                    <input type="hidden" name="plan" value={p.id} />
                    <SubmitButton className="w-full">Upgrade to {p.name}</SubmitButton>
                  </ActionForm>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    {billingEnabled ? "Owners can upgrade" : "Not available yet"}
                  </Button>
                ))}
            </PlanCard>
          ))}
        </div>
      </section>
    </>
  );
}
