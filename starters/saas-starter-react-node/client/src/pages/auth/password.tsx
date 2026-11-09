import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { KeyRound, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FormError, SubmitButton } from "@/components/field";
import { authClient } from "@/lib/auth-client";
import { useAppConfig, useShowSetupHints } from "@/lib/queries";
import { z } from "zod";
import { AuthCard, IconBadge } from "./auth-card";

const backToSignIn = <Link to="/sign-in" className="text-primary-text font-medium hover:underline">Back to sign in</Link>;

export function ForgotPassword() {
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const hints = useShowSetupHints();
  const [sent, setSent] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; form?: string }>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    if (!z.email().safeParse(email).success) return setErrors({ email: "Enter a valid email address" });
    setErrors({});
    setPending(true);
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    if (error) return setErrors({ form: error.message ?? "Could not send the link" });
    setSent(email);
  }

  if (sent) {
    return (
      <AuthCard icon={<IconBadge><MailCheck aria-hidden /></IconBadge>} title="Check your email"
        description={<>If an account exists for <strong className="text-foreground">{sent}</strong>, a link to reset the password is on its way. It expires in one hour.</>}
        footer={backToSignIn}>
        {!emailEnabled && hints && (
          <p className="bg-surface text-muted-foreground rounded-lg border p-3 text-xs">Development note: email is not set up (no RESEND_API_KEY), so the link is written to the server log.</p>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" description="Enter your email and we will send you a link to choose a new one." footer={backToSignIn}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormError message={errors.form} />
        <Field label="Email" id="email" type="email" autoComplete="email" maxLength={254} required error={errors.email} />
        <SubmitButton pending={pending}>Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ password?: string; form?: string }>(params.get("error") ? { form: "This link is invalid or has expired. Ask for a new one." } : {});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    if (password.length < 8) return setErrors({ password: "Use at least 8 characters" });
    setErrors({});
    setPending(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token: token ?? "" });
    setPending(false);
    if (error) return setErrors({ form: error.code === "INVALID_TOKEN" ? "This link is invalid or has expired. Ask for a new one." : error.message ?? "Could not reset the password" });
    toast.success("Password changed. Sign in with your new password.");
    navigate("/sign-in");
  }

  if (!token) {
    return (
      <AuthCard icon={<IconBadge><KeyRound aria-hidden /></IconBadge>} title="This link is incomplete"
        description="The reset link is missing its token. Ask for a new one and open it straight from the email." footer={backToSignIn}>
        <Button asChild className="w-full"><Link to="/forgot-password">Ask for a new link</Link></Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" description="Other devices are signed out once you save it."
      footer={<Link to="/forgot-password" className="hover:text-foreground">Ask for a new link</Link>}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormError message={errors.form} />
        <Field label="New password" id="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required hint="At least 8 characters." error={errors.password} />
        <SubmitButton pending={pending}>Save password</SubmitButton>
      </form>
    </AuthCard>
  );
}
