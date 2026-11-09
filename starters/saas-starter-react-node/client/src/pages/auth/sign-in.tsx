import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/field";
import { SocialButtons } from "@/components/social-buttons";
import { authClient, useSession } from "@/lib/auth-client";
import { safeNext } from "@/lib/next";
import { AuthCard } from "./auth-card";

export function SignIn() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"), "/dashboard");
  const navigate = useNavigate();
  const { refetch } = useSession();
  const [error, setError] = useState<string | null>(params.get("error") ? "Sign-in failed. Try again." : null);
  const [unverified, setUnverified] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password: String(form.get("password")) });
    setPending(false);
    // Load the new session before leaving, so guarded pages see it.
    if (!error) return refetch().then(() => navigate(next));
    if (error.code === "EMAIL_NOT_VERIFIED") {
      setUnverified(email);
      return setError("Confirm your email first. We sent you a new link.");
    }
    setError(error.message ?? "Could not sign in");
  }

  return (
    <AuthCard
      title="Sign in"
      description="Welcome back."
      footer={<>No account? <Link className="text-foreground ml-1 underline" to={`/sign-up?next=${encodeURIComponent(next)}`}>Sign up</Link></>}
    >
      <SocialButtons next={next} />
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Email" id="email" type="email" autoComplete="email" required />
        <Field label="Password" id="password" type="password" autoComplete="current-password" required />
        <FormError message={error} />
        {unverified && (
          <Button type="button" variant="link" className="h-auto justify-start p-0"
            onClick={() => authClient.sendVerificationEmail({ email: unverified, callbackURL: next })}>
            Send the link again
          </Button>
        )}
        <Button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
        <Link to="/forgot-password" className="text-muted-foreground text-center text-sm underline">Forgot your password?</Link>
      </form>
    </AuthCard>
  );
}
