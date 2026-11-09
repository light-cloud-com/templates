import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Field, FormError, SubmitButton } from "@/components/field";
import { SocialButtons } from "@/components/social-buttons";
import { authClient, useSession } from "@/lib/auth-client";
import { safeNext } from "@/lib/next";
import { AuthCard } from "./auth-card";

export function SignIn() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"), "/dashboard");
  const navigate = useNavigate();
  const { refetch } = useSession();
  const [errors, setErrors] = useState<Record<string, string | undefined>>(params.get("error") ? { form: "Sign-in failed. Try again." } : {});
  const [unverified, setUnverified] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const missing = { email: email ? undefined : "Enter your email", password: password ? undefined : "Enter your password" };
    if (missing.email || missing.password) return setErrors(missing);
    setPending(true);
    setErrors({});
    const { error } = await authClient.signIn.email({ email, password });
    // Load the new session before leaving, so guarded pages see it.
    if (!error) return refetch().then(() => navigate(next));
    setPending(false);
    if (error.code === "EMAIL_NOT_VERIFIED") {
      setUnverified(email);
      return setErrors({ form: "Confirm your email first. We sent you a new link." });
    }
    setErrors({ form: error.code === "INVALID_EMAIL_OR_PASSWORD" ? "That email and password do not match an account." : error.message ?? "Could not sign in" });
  }

  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Sign in to your workspace."
      footer={<p>No account yet? <Link className="text-primary-text font-medium hover:underline" to={`/sign-up?next=${encodeURIComponent(next)}`}>Create one</Link></p>}
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormError message={errors.form} />
        <Field label="Email" id="email" type="email" autoComplete="email" maxLength={254} required error={errors.email} />
        <div className="grid gap-1.5">
          <Field label="Password" id="password" type="password" autoComplete="current-password" required error={errors.password} />
          <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground justify-self-end text-[0.8125rem]">Forgot your password?</Link>
        </div>
        {unverified && (
          <Button type="button" variant="link" className="h-auto justify-start p-0"
            onClick={() => authClient.sendVerificationEmail({ email: unverified, callbackURL: next })}>
            Send the link again
          </Button>
        )}
        <SubmitButton pending={pending}>Sign in</SubmitButton>
      </form>
      <SocialButtons next={next} />
    </AuthCard>
  );
}
