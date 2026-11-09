import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { SocialButtons } from "@/components/social-buttons";
import { socialProviders } from "@/lib/config";
import { safeNext } from "@/lib/url";
import { signInAction } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next, reset } = await searchParams;
  const nextPath = safeNext(next);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        {reset && <p className="mt-2 text-sm text-muted-foreground">Your password was changed. Sign in with the new one.</p>}
      </div>
      <SocialButtons providers={socialProviders} next={nextPath} />
      <ActionForm action={signInAction}>
        <input type="hidden" name="next" value={nextPath} />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
        <SubmitButton className="w-full">Sign in</SubmitButton>
      </ActionForm>
      <div className="flex justify-between text-sm">
        <Link className="text-primary underline-offset-4 hover:underline" href="/forgot-password">Forgot password?</Link>
        <Link className="text-primary underline-offset-4 hover:underline" href={`/sign-up${next ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>
          Create an account
        </Link>
      </div>
    </div>
  );
}
