import type { Metadata } from "next";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/session";
import { changeEmailAction, changePasswordAction, deleteAccountAction, updateNameAction } from "./actions";

export const metadata: Metadata = { title: "Account settings" };

export default async function AccountPage() {
  const { user } = await requireUser();
  return (
    <>
      <Card>
        <CardHeader><CardTitle><h1>Profile</h1></CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <ActionForm action={updateNameAction}>
            <Field label="Name" name="name" defaultValue={user.name} autoComplete="name" required />
            <SubmitButton>Save name</SubmitButton>
          </ActionForm>
          <ActionForm action={changeEmailAction}>
            <Field label="Email" name="email" type="email" defaultValue={user.email} autoComplete="email" required />
            <SubmitButton>Change email</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle><h2>Password</h2></CardTitle></CardHeader>
        <CardContent>
          <ActionForm action={changePasswordAction} resetOnSuccess>
            <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
            <Field label="New password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
            <SubmitButton>Change password</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle><h2>Delete account</h2></CardTitle>
          <CardDescription>Removes your account and any workspace where you are the only member.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={deleteAccountAction}>
            <Field label="Password" name="password" type="password" autoComplete="current-password" hint="Leave empty if you signed up with GitHub or Google." />
            <SubmitButton variant="destructive">Delete my account</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
    </>
  );
}
