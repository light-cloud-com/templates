import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { resetPasswordAction } from "../actions";

export const metadata: Metadata = { title: "Choose a new password" };

// Better Auth checks the emailed link and lands here with ?token=… (or ?error=INVALID_TOKEN).
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token, error } = await searchParams;
  if (error || typeof token !== "string") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">This link has expired</h1>
        <p className="text-sm text-muted-foreground">Reset links work once, for one hour.</p>
        <Link className="text-sm text-primary underline-offset-4 hover:underline" href="/forgot-password">Send a new link</Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      <ActionForm action={resetPasswordAction}>
        <input type="hidden" name="token" value={token} />
        <Field label="New password" name="newPassword" type="password" autoComplete="new-password" minLength={8} hint="At least 8 characters." required />
        <SubmitButton className="w-full">Save password</SubmitButton>
      </ActionForm>
    </div>
  );
}
