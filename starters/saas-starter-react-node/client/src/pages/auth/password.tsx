import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/field";
import { authClient } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";
import { AuthCard } from "./auth-card";

export function ForgotPassword() {
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    if (error) return setError(error.message ?? "Could not send the link");
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your inbox" description="If an account exists for that email, a reset link is on its way.">
        {!emailEnabled && (
          <p className="text-muted-foreground text-sm">Email is not set up on this deployment yet, so the link is written to the server log.</p>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" description="We will send you a link to choose a new one."
      footer={<Link to="/sign-in" className="underline">Back to sign in</Link>}>
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Email" id="email" type="email" autoComplete="email" required />
        <FormError message={error} />
        <Button type="submit">Send reset link</Button>
      </form>
    </AuthCard>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(params.get("error") ? "This link is invalid or has expired." : null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { error } = await authClient.resetPassword({ newPassword: String(new FormData(e.currentTarget).get("password")), token: token ?? "" });
    if (error) return setError(error.message ?? "Could not reset the password");
    toast.success("Password changed. Sign in with your new password.");
    navigate("/sign-in");
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="New password" id="password" type="password" autoComplete="new-password" minLength={8} required />
        <FormError message={!token ? "This link is missing its token. Ask for a new one." : error} />
        <Button type="submit" disabled={!token}>Save password</Button>
        <Link to="/forgot-password" className="text-muted-foreground text-center text-sm underline">Ask for a new link</Link>
      </form>
    </AuthCard>
  );
}
