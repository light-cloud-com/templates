import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/confirm";
import { Field, FormError, SubmitButton } from "@/components/field";
import { authClient, useSession } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";
import { LIMITS, userName } from "@shared/schemas.ts";
import { z } from "zod";
import { Section } from "./section";

type Errors = Record<string, string | undefined>;
type AuthError = { message?: string; code?: string } | null;

/**
 * Runs a form action. `check` returns field errors before sending; `field` says which field a
 * server error belongs to (by Better Auth error code). Values stay in the form after an error.
 */
function useForm(action: (form: FormData) => Promise<{ error: AuthError }>, opts: {
  success: (form: FormData) => string;
  check?: (form: FormData) => Errors | null;
  field?: (error: NonNullable<AuthError>) => string;
  message?: (error: NonNullable<AuthError>) => string | undefined;
  clear?: boolean;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const invalid = opts.check?.(form);
    if (invalid) return setErrors(invalid);
    setErrors({});
    setPending(true);
    const { error } = await action(form).catch((err: Error) => ({ error: { message: err.message } as AuthError }));
    setPending(false);
    if (error) return setErrors({ [opts.field?.(error) ?? "form"]: opts.message?.(error) || error.message || "Something went wrong" });
    toast.success(opts.success(form));
    if (opts.clear) formEl.reset();
  };
  return { errors, pending, onSubmit };
}

const email = z.email("Enter a valid email address");

export function AccountSettings() {
  const user = useSession().data?.user;
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletePassword, setDeletePassword] = useState("");

  const profile = useForm((f) => authClient.updateUser({ name: String(f.get("name")).trim() }), {
    success: () => "Name saved",
    check: (f) => { const r = userName.safeParse(f.get("name")); return r.success ? null : { name: r.error.issues[0]?.message }; },
    field: () => "name",
  });
  const changeEmail = useForm((f) => authClient.changeEmail({ newEmail: String(f.get("email")).trim(), callbackURL: "/settings/account" }), {
    success: (f) => emailEnabled ? `Check ${String(f.get("email"))} to confirm the change` : `Email changed to ${String(f.get("email")).trim().toLowerCase()}`,
    check: (f) => { const r = email.safeParse(String(f.get("email")).trim()); return r.success ? null : { email: r.error.issues[0]?.message }; },
    field: () => "email",
    clear: true,
  });
  const password = useForm(
    (f) => authClient.changePassword({ currentPassword: String(f.get("current")), newPassword: String(f.get("new")), revokeOtherSessions: true }),
    {
      success: () => "Password changed. Other devices were signed out.",
      check: (f) => {
        if (!f.get("current")) return { current: "Enter your current password" };
        return String(f.get("new")).length < 8 ? { new: "Use at least 8 characters" } : null;
      },
      field: (err) => (err.code === "INVALID_PASSWORD" ? "current" : err.code?.startsWith("PASSWORD_") ? "new" : "form"),
      message: (err) => (err.code === "INVALID_PASSWORD" ? "That password is not right" : err.message),
      clear: true,
    },
  );

  async function deleteAccount() {
    const { error } = await authClient.deleteUser({ password: deletePassword || undefined });
    if (error) throw new Error(error.code === "INVALID_PASSWORD" ? "That password is not right" : error.message ?? "Could not delete the account");
    queryClient.clear();
    toast.success("Your account was deleted");
    navigate("/");
  }

  if (!user) return null;
  return (
    <>
      <Section title="Profile" description="Your name appears to your teammates.">
        <form onSubmit={profile.onSubmit} noValidate className="grid max-w-md gap-4">
          <FormError message={profile.errors.form} />
          <Field label="Name" id="name" defaultValue={user.name} autoComplete="name" maxLength={LIMITS.userName} required error={profile.errors.name} />
          <SubmitButton pending={profile.pending} className="justify-self-start">Save</SubmitButton>
        </form>
      </Section>
      <Section title="Email" description={<>You sign in with <span className="text-foreground font-medium">{user.email}</span>.</>}>
        <form onSubmit={changeEmail.onSubmit} noValidate className="grid max-w-md gap-4">
          <FormError message={changeEmail.errors.form} />
          <Field label="New email" id="email" type="email" autoComplete="email" maxLength={254} required error={changeEmail.errors.email}
            hint={emailEnabled ? "We send a link to the new address to confirm it." : undefined} />
          <SubmitButton pending={changeEmail.pending} className="justify-self-start">Change email</SubmitButton>
        </form>
      </Section>
      <Section title="Password" description="Changing it signs you out on your other devices.">
        <form onSubmit={password.onSubmit} noValidate className="grid max-w-md gap-4">
          <FormError message={password.errors.form} />
          <Field label="Current password" id="current" type="password" autoComplete="current-password" required error={password.errors.current} />
          <Field label="New password" id="new" type="password" autoComplete="new-password" minLength={8} maxLength={128} required error={password.errors.new} hint="At least 8 characters." />
          <SubmitButton pending={password.pending} className="justify-self-start">Change password</SubmitButton>
        </form>
      </Section>
      <Section title="Delete account" danger description="Removes your account. Workspaces where you are the only member are deleted with it.">
        <Confirm
          trigger={<Button variant="destructive-outline">Delete my account</Button>}
          title="Delete your account?"
          description="Your account and every workspace only you belong to are deleted. This cannot be undone."
          action="Delete my account"
          onOpenChange={(o) => !o && setDeletePassword("")}
          onConfirm={deleteAccount}
        >
          <Field label="Password" id="delete-password" type="password" autoComplete="current-password" value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)} hint="Leave empty if you signed up with GitHub or Google." />
        </Confirm>
      </Section>
    </>
  );
}
