import type { Metadata } from "next";
import { AuthCard, TextLink } from "@/components/auth-card";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { SocialButtons } from "@/components/social-buttons";
import { socialProviders } from "@/lib/config";
import { safeNext } from "@/lib/url";
import { limits } from "@/lib/validation";
import { signInAction } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next, reset } = await searchParams;
  const nextPath = safeNext(next);
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account."
      footer={<p>New here? <TextLink href={`/sign-up${next ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>Create an account</TextLink></p>}
    >
      {reset && <p role="status" className="rounded-lg border border-success/30 bg-success/10 px-3 py-2">Your password was changed. Sign in with the new one.</p>}
      <SocialButtons providers={socialProviders} next={nextPath} />
      <ActionForm action={signInAction}>
        <input type="hidden" name="next" value={nextPath} />
        <Field label="Email" name="email" type="email" autoComplete="email" maxLength={limits.email} required />
        <div className="space-y-2">
          <Field label="Password" name="password" type="password" autoComplete="current-password" maxLength={limits.password} required />
          <p className="text-right text-xs"><TextLink href="/forgot-password">Forgot password?</TextLink></p>
        </div>
        <SubmitButton className="w-full">Sign in</SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}
