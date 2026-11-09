import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { MailCheck } from "lucide-react";
import { Field, FormError, SubmitButton } from "@/components/field";
import { SocialButtons } from "@/components/social-buttons";
import { authClient, useSession } from "@/lib/auth-client";
import { safeNext } from "@/lib/next";
import { useAppConfig } from "@/lib/queries";
import { getPlan, PLANS } from "@shared/plans.ts";
import { LIMITS, userName } from "@shared/schemas.ts";
import { z } from "zod";
import { AuthCard, IconBadge } from "./auth-card";

const email = z.email("Enter a valid email address");

export function SignUp() {
  const [params] = useSearchParams();
  // A plan picked on the pricing page travels on to onboarding.
  const plan = PLANS.find((p) => p.id === params.get("plan") && p.priceMonthly > 0)?.id;
  const next = plan ? `/onboarding?plan=${plan}` : safeNext(params.get("next"), "/onboarding");
  const navigate = useNavigate();
  const { refetch } = useSession();
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = { name: String(form.get("name")), email: String(form.get("email")).trim(), password: String(form.get("password")) };
    const name = userName.safeParse(values.name);
    const found = {
      name: name.success ? undefined : name.error.issues[0]?.message,
      email: email.safeParse(values.email).success ? undefined : "Enter a valid email address",
      password: values.password.length >= 8 ? undefined : "Use at least 8 characters",
    };
    if (found.name || found.email || found.password) return setErrors(found);
    setPending(true);
    setErrors({});
    const { data, error } = await authClient.signUp.email({ name: values.name.trim(), email: values.email, password: values.password, callbackURL: next });
    setPending(false);
    if (error) {
      if (error.code?.startsWith("USER_ALREADY_EXISTS")) return setErrors({ email: "An account with this email already exists. Sign in instead." });
      if (error.code?.startsWith("PASSWORD_")) return setErrors({ password: error.message });
      return setErrors({ form: error.message ?? "Could not create the account" });
    }
    // With email set up, the account is confirmed by link before the first sign-in.
    if (!data?.token) return setSentTo(values.email);
    await refetch(); // guarded pages must see the new session
    navigate(next);
  }

  if (sentTo) {
    return (
      <AuthCard icon={<IconBadge><MailCheck aria-hidden /></IconBadge>} title="Check your inbox"
        description={<>We sent a confirmation link to <strong className="text-foreground">{sentTo}</strong>. Open it to finish signing up.</>}
        footer={<Link to="/sign-in" className="text-primary-text font-medium hover:underline">Back to sign in</Link>} />
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description={plan ? `Free to start. You can confirm the ${getPlan(plan).name} plan after setting up your workspace.` : "Free to start. No card needed."}
      footer={<p>Already have an account? <Link className="text-primary-text font-medium hover:underline" to={`/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link></p>}
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormError message={errors.form} />
        <Field label="Name" id="name" autoComplete="name" maxLength={LIMITS.userName} required error={errors.name} />
        <Field label="Email" id="email" type="email" autoComplete="email" maxLength={254} defaultValue={params.get("email") ?? ""} required error={errors.email} />
        <Field label="Password" id="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} hint="At least 8 characters." required error={errors.password} />
        <SubmitButton pending={pending}>Create account</SubmitButton>
        {emailEnabled && <p className="text-muted-foreground text-xs">We will email you a link to confirm your address.</p>}
        <p className="text-muted-foreground text-xs">
          By signing up you agree to the <Link to="/terms" className="hover:text-foreground underline underline-offset-2">terms</Link> and <Link to="/privacy" className="hover:text-foreground underline underline-offset-2">privacy policy</Link>.
        </p>
      </form>
      <SocialButtons next={next} newUser={next} />
    </AuthCard>
  );
}
