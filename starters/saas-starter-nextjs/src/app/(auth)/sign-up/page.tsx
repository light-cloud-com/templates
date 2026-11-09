import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { SocialButtons } from "@/components/social-buttons";
import { socialProviders } from "@/lib/config";
import { safeNext } from "@/lib/url";
import { signUpAction } from "../actions";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const { next, email } = await searchParams;
  const nextPath = safeNext(next, "/onboarding");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <SocialButtons providers={socialProviders} next={nextPath} />
      <ActionForm action={signUpAction}>
        <input type="hidden" name="next" value={nextPath} />
        <Field label="Name" name="name" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={typeof email === "string" ? email : undefined} required />
        <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} hint="At least 8 characters." required />
        <SubmitButton className="w-full">Create account</SubmitButton>
      </ActionForm>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="text-primary underline-offset-4 hover:underline" href={`/sign-in${next ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>
          Sign in
        </Link>
        . By signing up you agree to the <Link className="underline" href="/terms">terms</Link>.
      </p>
    </div>
  );
}
