import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { forgotPasswordAction } from "../actions";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your email and we will send you a link to choose a new password.</p>
      </div>
      <ActionForm action={forgotPasswordAction}>
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <SubmitButton className="w-full">Send reset link</SubmitButton>
      </ActionForm>
      <Link className="text-sm text-primary underline-offset-4 hover:underline" href="/sign-in">Back to sign in</Link>
    </div>
  );
}
