import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/session";
import { acceptInviteAction, declineInviteAction, signOutAction } from "../../actions";

export const metadata: Metadata = { title: "Join a workspace" };

// The invitation id is the secret in the link, so anyone holding it may see which workspace it is for.
export default async function InvitePage({ params }: PageProps<"/invite/[id]">) {
  const { id } = await params;
  const [invite] = await db
    .select({ id: schema.invitation.id, email: schema.invitation.email, role: schema.invitation.role, status: schema.invitation.status, expiresAt: schema.invitation.expiresAt, workspace: schema.organization.name })
    .from(schema.invitation)
    .innerJoin(schema.organization, eq(schema.organization.id, schema.invitation.organizationId))
    .where(eq(schema.invitation.id, id));

  if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">This invitation is no longer valid</h1>
        <p className="text-sm text-muted-foreground">It was used, cancelled or has expired. Ask the person who invited you for a new one.</p>
        <Button asChild variant="outline"><Link href="/">Go home</Link></Button>
      </div>
    );
  }

  const session = await getSession();
  const path = `/invite/${invite.id}`;
  const heading = (
    <div>
      <h1 className="text-2xl font-semibold">Join {invite.workspace}</h1>
      <p className="mt-2 text-sm text-muted-foreground">You were invited as {invite.role ?? "member"}.</p>
    </div>
  );

  if (!session) {
    return (
      <div className="space-y-6">
        {heading}
        <p className="text-sm">Create an account or sign in with <strong>{invite.email}</strong> to accept.</p>
        <div className="flex flex-col gap-2">
          <Button asChild><Link href={`/sign-up?next=${encodeURIComponent(path)}&email=${encodeURIComponent(invite.email)}`}>Create account</Link></Button>
          <Button asChild variant="outline"><Link href={`/sign-in?next=${encodeURIComponent(path)}`}>Sign in</Link></Button>
        </div>
      </div>
    );
  }

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="space-y-6">
        {heading}
        <p className="text-sm">This invitation is for <strong>{invite.email}</strong>, but you are signed in as <strong>{session.user.email}</strong>.</p>
        <form action={signOutAction}><Button type="submit" variant="outline">Sign out</Button></form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {heading}
      <ActionForm action={acceptInviteAction}>
        <input type="hidden" name="invitationId" value={invite.id} />
        <SubmitButton className="w-full">Accept invitation</SubmitButton>
      </ActionForm>
      <ActionForm action={declineInviteAction}>
        <input type="hidden" name="invitationId" value={invite.id} />
        <SubmitButton variant="ghost" className="w-full">Decline</SubmitButton>
      </ActionForm>
    </div>
  );
}
