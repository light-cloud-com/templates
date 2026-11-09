import type { Metadata } from "next";
import { AuthCard, TextLink } from "@/components/auth-card";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { emailEnabled } from "@/lib/config";
import { limits } from "@/lib/validation";
import { forgotPasswordAction } from "../actions";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we will send you a link to choose a new password."
      footer={<p>Remembered it? <TextLink href="/sign-in">Back to sign in</TextLink></p>}
    >
      <ActionForm action={forgotPasswordAction} showSuccess>
        <Field label="Email" name="email" type="email" autoComplete="email" maxLength={limits.email} required />
        <SubmitButton className="w-full">Send reset link</SubmitButton>
      </ActionForm>
      {/* Developer note, only while running `npm run dev` without an email provider. */}
      {!emailEnabled && process.env.NODE_ENV === "development" && (
        <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          Development: RESEND_API_KEY is not set, so the reset link is printed in the terminal running the app.
        </p>
      )}
    </AuthCard>
  );
}
