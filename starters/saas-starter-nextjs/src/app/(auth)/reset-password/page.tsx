import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { limits } from "@/lib/validation";
import { resetPasswordAction } from "../actions";

export const metadata: Metadata = { title: "Choose a new password" };

// Better Auth checks the emailed link and lands here with ?token=… (or ?error=INVALID_TOKEN).
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token, error } = await searchParams;
  if (error || typeof token !== "string") {
    return (
      <AuthCard title="This link has expired" description="Reset links work once, for one hour.">
        <Button asChild className="w-full">
          <Link href="/forgot-password">Send a new link</Link>
        </Button>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Choose a new password" description="You will sign in with it from now on.">
      <ActionForm action={resetPasswordAction}>
        <input type="hidden" name="token" value={token} />
        <Field label="New password" name="newPassword" type="password" autoComplete="new-password" maxLength={limits.password} hint="At least 8 characters." required />
        <SubmitButton className="w-full">Save password</SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}
