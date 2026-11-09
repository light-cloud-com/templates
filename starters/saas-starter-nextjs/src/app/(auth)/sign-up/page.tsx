import type { Metadata } from "next";
import { AuthCard, TextLink } from "@/components/auth-card";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { SocialButtons } from "@/components/social-buttons";
import { billingEnabled, socialProviders } from "@/lib/config";
import { getPlan } from "@/lib/plans";
import { safeNext } from "@/lib/url";
import { limits } from "@/lib/validation";
import { signUpAction } from "../actions";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const { next, email, plan } = await searchParams;
  // A paid plan picked on the pricing page rides along to the plan step of onboarding.
  const chosen = billingEnabled && (plan === "pro" || plan === "business") ? getPlan(plan) : undefined;
  const nextPath = safeNext(next, chosen ? `/onboarding?plan=${chosen.id}` : "/onboarding");
  const signInHref = `/sign-in${next ? `?next=${encodeURIComponent(nextPath)}` : ""}`;
  return (
    <AuthCard
      title="Create your account"
      description={chosen ? `You picked ${chosen.name}. Set up your workspace first, then confirm the plan.` : `Free for up to ${getPlan("free").limits.projects} projects. No card needed.`}
      footer={
        <>
          <p>Already have an account? <TextLink href={signInHref}>Sign in</TextLink></p>
          <p className="text-xs">By creating an account you agree to the <TextLink href="/terms">terms</TextLink> and <TextLink href="/privacy">privacy policy</TextLink>.</p>
        </>
      }
    >
      <SocialButtons providers={socialProviders} next={nextPath} />
      <ActionForm action={signUpAction} showSuccess>
        <input type="hidden" name="next" value={nextPath} />
        <Field label="Name" name="name" autoComplete="name" maxLength={limits.personName} required />
        <Field label="Email" name="email" type="email" autoComplete="email" maxLength={limits.email} defaultValue={typeof email === "string" ? email : undefined} required />
        <Field label="Password" name="password" type="password" autoComplete="new-password" maxLength={limits.password} hint="At least 8 characters." required />
        <SubmitButton className="w-full">Create account</SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}
