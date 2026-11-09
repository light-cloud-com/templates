import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { completeOnboardingAction, createWorkspaceAction } from "@/app/(app)/actions";
import { upgradeAction } from "@/app/(app)/settings/billing/actions";
import { inviteMemberAction } from "@/app/(app)/settings/members/actions";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Logo } from "@/components/logo";
import { PlanCard } from "@/components/plan-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { billingEnabled, config } from "@/lib/config";
import { plans } from "@/lib/plans";
import { listWorkspaces, requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Set up your workspace" };

const steps = [
  { id: "workspace", label: "Workspace" },
  { id: "invite", label: "Invite" },
  ...(billingEnabled ? [{ id: "plan", label: "Plan" }] : []),
];

// First-time setup, shown once after sign-up: workspace, optional invites, plan (when billing is on).
export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const { user } = await requireUser();
  const hasWorkspace = (await listWorkspaces(user.id)).length > 0;
  if (user.onboardingCompleted && hasWorkspace) redirect("/dashboard");

  const requested = (await searchParams).step;
  const step = !hasWorkspace ? "workspace" : steps.some((s) => s.id === requested && s.id !== "workspace") ? requested : "invite";
  const isLast = step === steps[steps.length - 1].id;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
        <Logo name={config.appName} href="/onboarding" />
        <ThemeToggle />
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8">
        <ol aria-label="Setup steps" className="flex gap-2 text-sm">
          {steps.map((s, i) => (
            <li key={s.id} aria-current={s.id === step ? "step" : undefined} className={cn("flex-1 border-t-4 pt-2 text-muted-foreground", s.id === step && "border-primary font-medium text-foreground")}>
              {i + 1}. {s.label}
            </li>
          ))}
        </ol>

        {step === "workspace" && (
          <section className="max-w-md space-y-4">
            <h1 className="text-2xl font-semibold">Name your workspace</h1>
            <p className="text-sm text-muted-foreground">A workspace holds your team, projects and billing. You can rename it later.</p>
            <ActionForm action={createWorkspaceAction}>
              <input type="hidden" name="next" value={user.onboardingCompleted ? "/dashboard" : "/onboarding?step=invite"} />
              <Field label="Workspace name" name="name" placeholder="e.g. Acme Inc" required maxLength={80} autoFocus />
              <SubmitButton>Continue</SubmitButton>
            </ActionForm>
          </section>
        )}

        {step === "invite" && (
          <section className="max-w-md space-y-4">
            <h1 className="text-2xl font-semibold">Invite your teammates</h1>
            <p className="text-sm text-muted-foreground">Optional. Add one email at a time; you can invite more later from Settings → Members.</p>
            <ActionForm action={inviteMemberAction} resetOnSuccess>
              <input type="hidden" name="role" value="member" />
              <Field label="Teammate's email" name="email" type="email" required />
              <SubmitButton variant="outline">Send invite</SubmitButton>
            </ActionForm>
            <NextStep isLast={isLast} href="/onboarding?step=plan" />
          </section>
        )}

        {step === "plan" && (
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Choose a plan</h1>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((p) => (
                <PlanCard key={p.id} plan={p} highlight={p.id === "pro"}>
                  {p.id === "free" ? (
                    <form action={completeOnboardingAction}><Button type="submit" variant="outline" className="w-full">Continue on Free</Button></form>
                  ) : (
                    <ActionForm action={upgradeAction} className="space-y-2">
                      <input type="hidden" name="plan" value={p.id} />
                      <input type="hidden" name="from" value="onboarding" />
                      <SubmitButton className="w-full">Choose {p.name}</SubmitButton>
                    </ActionForm>
                  )}
                </PlanCard>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function NextStep({ isLast, href }: { isLast: boolean; href: string }) {
  if (isLast) {
    return (
      <form action={completeOnboardingAction}>
        <Button type="submit">Go to dashboard</Button>
      </form>
    );
  }
  return (
    <Button asChild>
      <Link href={href}>Continue</Link>
    </Button>
  );
}
