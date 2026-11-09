import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/field";
import { SocialButtons } from "@/components/social-buttons";
import { authClient, useSession } from "@/lib/auth-client";
import { safeNext } from "@/lib/next";
import { useAppConfig } from "@/lib/queries";
import { AuthCard } from "./auth-card";

export function SignUp() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"), "/onboarding");
  const navigate = useNavigate();
  const { refetch } = useSession();
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setPending(true);
    setError(null);
    const { data, error } = await authClient.signUp.email({
      name: String(form.get("name")),
      email,
      password: String(form.get("password")),
      callbackURL: next,
    });
    setPending(false);
    if (error) return setError(error.message ?? "Could not create the account");
    // With email set up, the account is confirmed by link before the first sign-in.
    if (!data?.token) return setSentTo(email);
    await refetch(); // guarded pages must see the new session
    navigate(next);
  }

  if (sentTo) {
    return (
      <AuthCard title="Check your inbox" description={<>We sent a confirmation link to <strong>{sentTo}</strong>. Open it to finish signing up.</>}>
        <MailCheck className="text-primary mx-auto size-10" aria-hidden />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description="Free to start. No card needed."
      footer={<>Already have an account? <Link className="text-foreground ml-1 underline" to={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link></>}
    >
      <SocialButtons next={next} />
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Name" id="name" autoComplete="name" required />
        <Field label="Email" id="email" type="email" autoComplete="email" defaultValue={params.get("email") ?? ""} required />
        <Field label="Password" id="password" type="password" autoComplete="new-password" minLength={8} hint="At least 8 characters." required />
        <FormError message={error} />
        <Button type="submit" disabled={pending}>{pending ? "Creating account…" : "Create account"}</Button>
        {emailEnabled && <p className="text-muted-foreground text-xs">We will email you a link to confirm your address.</p>}
        <p className="text-muted-foreground text-xs">
          By signing up you agree to the <Link to="/terms" className="underline">terms</Link> and <Link to="/privacy" className="underline">privacy policy</Link>.
        </p>
      </form>
    </AuthCard>
  );
}
