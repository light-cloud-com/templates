import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, LogOut, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusLayout } from "@/components/layouts";
import { PlanButton, PlanCards } from "@/components/plan-cards";
import { api } from "@/lib/api";
import { authClient, useActiveOrganization, useListOrganizations, useSession } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";
import { useTitle } from "@/lib/title";
import { cn } from "@/lib/utils";
import { InviteForm } from "@/features/workspaces/invite-form";
import { PendingInvitations } from "@/features/workspaces/pending-invitations";
import { usePendingInvitations } from "@/features/workspaces/use-invitations";
import { WorkspaceForm } from "@/features/workspaces/workspace-form";
import { getPlan, PLANS } from "@shared/plans.ts";

type Step = "workspace" | "invite" | "plan" | "done";
const LABELS: Record<Step, string> = { workspace: "Workspace", invite: "Invite", plan: "Plan", done: "Done" };

function Stepper({ steps, current }: { steps: Step[]; current: Step }) {
  const at = steps.indexOf(current);
  return (
    <ol aria-label="Setup steps" className="mb-8 flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === at ? "step" : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
          <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
            i < at && "bg-primary border-primary text-primary-foreground",
            i === at && "border-primary text-primary-text",
            i > at && "text-muted-foreground")}>
            {i < at ? <Check className="size-3.5" aria-label="Done" /> : i + 1}
          </span>
          <span className={cn("text-sm font-medium", i === at ? "text-foreground" : "text-muted-foreground", i !== at && "max-sm:sr-only")}>{LABELS[s]}</span>
          {i < steps.length - 1 && <span className={cn("h-px flex-1", i < at ? "bg-primary" : "bg-border")} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

function Card({ title, description, children }: { title: string; description: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-xl border p-5 sm:p-8">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** First-time setup: workspace, teammates (optional), plan (only with billing on), done. */
export function Onboarding() {
  const { data: orgs } = useListOrganizations();
  const activeId = useSession().data?.session.activeOrganizationId;
  const activeOrg = useActiveOrganization().data;
  const { billingEnabled, emailEnabled } = useAppConfig().data ?? {};
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const wanted = useSearchParams()[0].get("plan");
  const chosen = PLANS.some((p) => p.id === wanted && p.priceMonthly > 0) ? wanted : null;
  const [step, setStep] = useState<Step | null>(null);
  const current: Step = step ?? (orgs && orgs.length > 0 ? "invite" : "workspace");
  const workspaceId = activeId ?? orgs?.[0]?.id;
  const invites = usePendingInvitations(workspaceId, current === "invite").data;
  const steps: Step[] = billingEnabled ? ["workspace", "invite", "plan", "done"] : ["workspace", "invite", "done"];
  useTitle(`Set up: ${LABELS[current]}`);

  async function done() {
    await api("/me/onboarded", { method: "POST" });
    setStep("done");
  }
  async function upgrade(plan: string) {
    await api("/me/onboarded", { method: "POST" });
    const { error } = await authClient.subscription.upgrade({
      plan, referenceId: workspaceId, customerType: "organization",
      successUrl: "/dashboard?upgraded=1", cancelUrl: "/settings/billing",
    });
    if (error) window.location.assign(`/settings/billing?plan=${plan}`);
  }
  async function signOut() {
    await authClient.signOut();
    queryClient.clear();
    navigate("/");
  }
  const afterInvite = () => (billingEnabled ? setStep("plan") : void done());

  return (
    <FocusLayout wide={current === "plan"}
      aside={<Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground"><LogOut aria-hidden /> Sign out</Button>}>
      <div className={cn(current === "plan" && "mx-auto max-w-xl")}><Stepper steps={steps} current={current} /></div>

      {current === "workspace" && (
        <Card title={activeOrg ? "Your workspace" : "Create your workspace"} description="A workspace holds your team's projects, members and billing.">
          <WorkspaceForm key={activeOrg?.id ?? "new"} workspace={activeOrg ? { id: activeOrg.id, name: activeOrg.name } : undefined}
            submitLabel="Continue" onDone={() => setStep("invite")} />
        </Card>
      )}

      {current === "invite" && workspaceId && (
        <Card title="Invite your teammates"
          description={emailEnabled ? "They get an email with a link to join. You can also do this later in Settings." : "Each invitation has a link to copy and send them. You can also do this later in Settings."}>
          <div className="grid gap-5">
            <InviteForm organizationId={workspaceId} />
            <PendingInvitations organizationId={workspaceId} canCancel stacked />
            <div className="flex flex-wrap items-center gap-2 border-t pt-5">
              <Button variant="ghost" onClick={() => setStep("workspace")}>Back</Button>
              <div className="ml-auto flex gap-2">
                {!invites?.length && <Button variant="outline" onClick={afterInvite}>Skip for now</Button>}
                <Button onClick={afterInvite} disabled={!invites?.length}>Continue</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {current === "plan" && (
        <section>
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold">Choose a plan</h1>
            <p className="text-muted-foreground mt-1 text-sm">Start on Free and upgrade whenever you like.</p>
          </div>
          <PlanCards selected={chosen}
            action={(plan) => plan.priceMonthly === 0
              ? <PlanButton variant="outline" onClick={() => void done()}>Continue on Free</PlanButton>
              : <PlanButton variant={(chosen ? chosen === plan.id : plan.highlighted) ? "default" : "outline"} onClick={() => upgrade(plan.id)}>Choose {plan.name}</PlanButton>} />
          <div className="mt-6 flex justify-center"><Button variant="ghost" onClick={() => setStep("invite")}>Back</Button></div>
        </section>
      )}

      {current === "done" && (
        <Card title="You are all set" description={`${activeOrg?.name ?? "Your workspace"} is ready.`}>
          <div className="grid gap-5">
            <span className="bg-primary/10 text-primary-text flex size-10 items-center justify-center rounded-full"><PartyPopper className="size-5" aria-hidden /></span>
            <ul className="text-muted-foreground grid gap-1.5 text-sm">
              <li>Your dashboard has a short checklist to get going.</li>
              {chosen && !billingEnabled && <li>Paid plans are not available yet, so the workspace is on {getPlan("free").name} for now.</li>}
            </ul>
            {/* A full load picks up the updated session. */}
            <Button className="justify-self-start" onClick={() => window.location.assign("/dashboard")}>Go to the dashboard</Button>
          </div>
        </Card>
      )}
    </FocusLayout>
  );
}
