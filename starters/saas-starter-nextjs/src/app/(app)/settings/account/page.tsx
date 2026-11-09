import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { Avatar } from "@/components/avatar";
import { ConfirmAction } from "@/components/confirm-action";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, schema } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { limits } from "@/lib/validation";
import { changeEmailAction, changePasswordAction, deleteAccountAction, updateNameAction } from "./actions";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountPage() {
  const { user } = await requireUser();
  // People who signed up with GitHub or Google have no password to change or confirm with.
  const [credential] = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(and(eq(schema.account.userId, user.id), eq(schema.account.providerId, "credential")));
  const hasPassword = Boolean(credential);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar name={user.name} seed={user.email} className="size-12 text-base" />
          <div className="min-w-0 space-y-1">
            <CardTitle><h2>Profile</h2></CardTitle>
            <CardDescription>Member since {formatDate(user.createdAt)}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <ActionForm action={updateNameAction}>
            <Field label="Name" name="name" defaultValue={user.name} autoComplete="name" maxLength={limits.personName} required />
            <SubmitButton variant="outline">Save name</SubmitButton>
          </ActionForm>
          <ActionForm action={changeEmailAction}>
            <Field label="Email" name="email" type="email" defaultValue={user.email} autoComplete="email" maxLength={limits.email} required />
            <SubmitButton variant="outline">Change email</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle><h2>Password</h2></CardTitle>
            <CardDescription>Changing it signs you out on every other device.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm action={changePasswordAction} resetOnSuccess className="max-w-md">
              <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" maxLength={limits.password} required />
              <Field label="New password" name="newPassword" type="password" autoComplete="new-password" hint="At least 8 characters." maxLength={limits.password} required />
              <SubmitButton variant="outline">Change password</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>
      )}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle><h2>Delete account</h2></CardTitle>
          <CardDescription>Removes your account and any workspace where you are the only member. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConfirmAction
            trigger={<Button variant="destructive-outline">Delete my account</Button>}
            action={deleteAccountAction}
            fields={{ hasPassword: hasPassword ? "1" : "0" }}
            title="Delete your account?"
            description="Your account, and workspaces where you are the only member, are deleted for good. Workspaces you own with other members must be handed over or deleted first."
            confirmLabel="Delete my account"
          >
            {hasPassword && <Field label="Password" name="password" type="password" autoComplete="current-password" maxLength={limits.password} required />}
          </ConfirmAction>
        </CardContent>
      </Card>
    </>
  );
}
