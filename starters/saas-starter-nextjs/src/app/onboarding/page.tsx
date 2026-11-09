import { Check, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { completeOnboardingAction, createWorkspaceAction } from "@/app/(app)/actions";
import { signOutAction } from "@/app/(auth)/actions";
import { upgradeAction } from "@/app/(app)/settings/billing/actions";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Logo } from "@/components/logo";
import { PlanCard } from "@/components/plan-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { billingEnabled, config } from "@/lib/config";
import { plans } from "@/lib/plans";
import { listWorkspaces, requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { limits } from "@/lib/validation";
import { InviteStep } from "./invite-step";

export const metadata: Metadata = { title: "Set up your workspace" };

const steps = [
  { id: "workspace", label: "Workspace" },
  { id: "invite", label: "Invite" },
  ...(billingEnabled ? [{ id: "plan", label: "Plan" }] : []),
  { id: "done", label: "Done" },
];

// First-time setup, shown once after sign-up: workspace, optional invites, plan (when billing is on).
export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const { user } = await requireUser();
  const workspaces = await listWorkspaces(user.id);
  if (user.onboardingCompleted && workspaces.length > 0) redirect("/dashboard");

  const sp = await searchParams;
  // A plan chosen on the pricing page (?plan=pro) is carried through every step.
  const plan = billingEnabled && (sp.plan === "pro" || sp.plan === "business") ? sp.plan : undefined;
  const href = (step: string) => `/onboarding?step=${step}${plan ? `&plan=${plan}` : ""}`;
  const step = workspaces.length === 0 ? "workspace" : steps.some((s) => s.id === sp.step && s.id !== "workspace") ? String(sp.step) : "invite";
  const index = steps.findIndex((s) => s.id === step);
  const after = (id: string) => steps[steps.findIndex((s) => s.id === id) + 1].id;

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-sm">
      <header className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
        <Logo name={config.appName} href="/onboarding" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">Sign out</Button>
          </form>
        </div>
      </header>
      <main id="main" className={cn("mx-auto w-full flex-1 px-4 pt-4 pb-16", step === "plan" ? "max-w-4xl" : "max-w-lg")}>
        <ol aria-label="Setup steps" className="mb-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s.id} aria-current={i === index ? "step" : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  i < index && "border-primary bg-primary text-primary-foreground",
                  i === index && "border-primary text-link",
                  i > index && "bg-background text-muted-foreground",
                )}
              >
                {i < index ? <Check className="size-3.5" aria-label="Done" /> : i + 1}
              </span>
              <span className={cn("text-xs font-medium", i === index ? "text-foreground" : "text-muted-foreground", "max-sm:sr-only")}>{s.label}</span>
              {i < steps.length - 1 && <span aria-hidden className={cn("h-px flex-1", i < index ? "bg-primary" : "bg-border")} />}
            </li>
          ))}
        </ol>

        <div className="rounded-lg border bg-background p-6 sm:p-8">
          {step === "workspace" && (
            <section className="space-y-6">
              <Heading title="Name your workspace" text="A workspace holds your team, projects and billing. You can rename it later." />
              <ActionForm action={createWorkspaceAction}>
                <input type="hidden" name="next" value={user.onboardingCompleted ? "/dashboard" : href("invite")} />
                <Field label="Workspace name" name="name" placeholder="e.g. Acme Inc" maxLength={limits.workspaceName} required autoFocus />
                <div className="flex justify-end">
                  <SubmitButton>Continue</SubmitButton>
                </div>
              </ActionForm>
            </section>
          )}

          {step === "invite" && (
            <section className="space-y-6">
              <Heading title="Invite your teammates" text={`Optional. They join ${workspaces[0]?.name ?? "your workspace"} as members. You get a link to share for each invite.`} />
              <InviteStep nextHref={href(after("invite"))} />
            </section>
          )}

          {step === "plan" && (
            <section className="space-y-6">
              <Heading title="Choose a plan" text="Start on Free and upgrade any time, or pick a paid plan now." />
              <div className="grid gap-4 md:grid-cols-3">
                {plans.map((p) => (
                  <PlanCard key={p.id} plan={p} highlight={p.id === (plan ?? "pro")} badge={p.id === plan ? "Your pick" : p.id === "pro" ? "Recommended" : undefined}>
                    {p.id === "free" ? (
                      <Button asChild variant="outline" className="w-full">
                        <Link href={href("done")}>Continue on Free</Link>
                      </Button>
                    ) : (
                      <ActionForm action={upgradeAction} className="space-y-2">
                        <input type="hidden" name="plan" value={p.id} />
                        <input type="hidden" name="from" value="onboarding" />
                        <SubmitButton className="w-full" variant={p.id === (plan ?? "pro") ? "default" : "outline"}>Choose {p.name}</SubmitButton>
                      </ActionForm>
                    )}
                  </PlanCard>
                ))}
              </div>
              <div className="border-t pt-6">
                <Button asChild variant="ghost">
                  <Link href={href("invite")}>Back</Link>
                </Button>
              </div>
            </section>
          )}

          {step === "done" && (
            <section className="space-y-6 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                <PartyPopper className="size-5 text-link" aria-hidden />
              </span>
              <Heading title="You are all set" text={`${workspaces[0]?.name ?? "Your workspace"} is ready. Your dashboard has a short checklist to get you going.`} />
              <div className="flex flex-col-reverse justify-center gap-2 sm:flex-row">
                <Button asChild variant="ghost">
                  <Link href={href(steps[index - 1].id)}>Back</Link>
                </Button>
                <form action={completeOnboardingAction}>
                  <Button type="submit" className="w-full">Go to dashboard</Button>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Heading({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
