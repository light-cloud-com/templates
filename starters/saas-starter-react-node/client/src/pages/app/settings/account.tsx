import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/field";
import { authClient, unwrap, useSession } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";
import { Section } from "./section";

/** Runs a form action and shows its error inline. */
function useAction(action: (form: FormData) => Promise<unknown>, success: string) {
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError(null);
    try {
      await action(new FormData(formEl));
      toast.success(success);
      formEl.querySelectorAll<HTMLInputElement>("input[type=password]").forEach((i) => (i.value = ""));
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return { error, onSubmit };
}

export function AccountSettings() {
  const user = useSession().data?.user;
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const profile = useAction((f) => unwrap(authClient.updateUser({ name: String(f.get("name")) })), "Name saved");
  const email = useAction(
    (f) => unwrap(authClient.changeEmail({ newEmail: String(f.get("email")), callbackURL: "/settings/account" })),
    emailEnabled ? "Check your inbox to confirm the new address" : "Email changed",
  );
  const password = useAction(
    (f) => unwrap(authClient.changePassword({ currentPassword: String(f.get("current")), newPassword: String(f.get("new")), revokeOtherSessions: true })),
    "Password changed. Other devices were signed out.",
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function deleteAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("delete-password"));
    if (!window.confirm("Delete your account and every workspace only you belong to? This cannot be undone.")) return;
    const { error } = await authClient.deleteUser({ password: pw || undefined });
    if (error) return setDeleteError(error.message ?? "Could not delete the account");
    window.location.assign("/");
  }

  if (!user) return null;
  return (
    <>
      <Section title="Profile">
        <form onSubmit={profile.onSubmit} className="grid max-w-sm gap-4">
          <Field label="Name" id="name" defaultValue={user.name} autoComplete="name" required />
          <FormError message={profile.error} />
          <Button type="submit" className="justify-self-start">Save</Button>
        </form>
      </Section>
      <Section title="Email" description={`Currently ${user.email}.`}>
        <form onSubmit={email.onSubmit} className="grid max-w-sm gap-4">
          <Field label="New email" id="email" type="email" autoComplete="email" required />
          <FormError message={email.error} />
          <Button type="submit" className="justify-self-start">Change email</Button>
        </form>
      </Section>
      <Section title="Password">
        <form onSubmit={password.onSubmit} className="grid max-w-sm gap-4">
          <Field label="Current password" id="current" type="password" autoComplete="current-password" required />
          <Field label="New password" id="new" type="password" autoComplete="new-password" minLength={8} required />
          <FormError message={password.error} />
          <Button type="submit" className="justify-self-start">Change password</Button>
        </form>
      </Section>
      <Section title="Delete account" danger description="Removes your account. Workspaces where you are the only member are deleted too.">
        <form onSubmit={deleteAccount} className="grid max-w-sm gap-4">
          <Field label="Password" id="delete-password" type="password" autoComplete="current-password" hint="Leave empty if you signed up with GitHub or Google." />
          <FormError message={deleteError} />
          <Button type="submit" variant="destructive" className="justify-self-start">Delete my account</Button>
        </form>
      </Section>
    </>
  );
}
