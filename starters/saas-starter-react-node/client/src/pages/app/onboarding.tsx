import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { PlanButton, PlanCards } from "@/components/plan-cards";
import { api } from "@/lib/api";
import { authClient, useListOrganizations, useSession } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";
import { InviteForm } from "@/features/workspaces/invite-form";
import { WorkspaceForm } from "@/features/workspaces/workspace-form";

type Step = "workspace" | "invite" | "plan";

/** First-time setup: workspace, teammates (optional), plan (only with billing on). */
export function Onboarding() {
  const { data: orgs } = useListOrganizations();
  const activeId = useSession().data?.session.activeOrganizationId;
  const billingEnabled = useAppConfig().data?.billingEnabled;
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step | null>(null);
  const current: Step = step ?? (orgs && orgs.length > 0 ? "invite" : "workspace");
  const workspaceId = activeId ?? orgs?.[0]?.id;
  const steps: Step[] = billingEnabled ? ["workspace", "invite", "plan"] : ["workspace", "invite"];

  async function finish(path = "/dashboard") {
    await api("/me/onboarded", { method: "POST" });
    await queryClient.invalidateQueries();
    window.location.assign(path); // full reload picks up the updated session
  }

  async function upgrade(plan: string) {
    await api("/me/onboarded", { method: "POST" });
    const { error } = await authClient.subscription.upgrade({
      plan, referenceId: workspaceId, customerType: "organization",
      successUrl: "/dashboard?upgraded=1", cancelUrl: "/dashboard",
    });
    if (error) window.location.assign("/dashboard");
  }

  const next = () => (current === "invite" && billingEnabled ? setStep("plan") : finish());

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Logo to="/onboarding" />
        <p className="text-muted-foreground text-sm" aria-live="polite">Step {steps.indexOf(current) + 1} of {steps.length}</p>
      </div>
      {current === "workspace" && (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle><h1>Create your workspace</h1></CardTitle>
            <CardDescription>Usually your company or team name. You can change it later.</CardDescription>
          </CardHeader>
          <CardContent><WorkspaceForm submitLabel="Continue" onCreated={() => setStep("invite")} /></CardContent>
        </Card>
      )}
      {current === "invite" && workspaceId && (
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle><h1>Invite your teammates</h1></CardTitle>
            <CardDescription>They get an email with a link to join. You can do this later in settings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <InviteForm organizationId={workspaceId} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={next}>Skip</Button>
              <Button onClick={next}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}
      {current === "plan" && (
        <div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Choose a plan</h1>
          <p className="text-muted-foreground mb-6 text-sm">Start on Free and upgrade whenever you like.</p>
          <PlanCards
            action={(plan) =>
              plan.priceMonthly === 0
                ? <PlanButton variant="outline" onClick={() => finish()}>Continue on Free</PlanButton>
                : <PlanButton variant={plan.highlighted ? "default" : "outline"} onClick={() => upgrade(plan.id)}>Choose {plan.name}</PlanButton>}
          />
        </div>
      )}
    </div>
  );
}
