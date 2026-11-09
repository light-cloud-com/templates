import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { ActionForm, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { db, schema } from "@/lib/db";
import { formatRole } from "@/lib/format";
import { getSession } from "@/lib/session";
import { acceptInviteAction, declineInviteAction, signOutAction } from "../../actions";

export const metadata: Metadata = { title: "Join a workspace" };

// The invitation id is the secret in the link, so anyone holding it may see which workspace it is for.
export default async function InvitePage({ params }: PageProps<"/invite/[id]">) {
  const { id } = await params;
  const [invite] = await db
    .select({ id: schema.invitation.id, email: schema.invitation.email, role: schema.invitation.role, status: schema.invitation.status, expiresAt: schema.invitation.expiresAt, workspace: schema.organization.name, inviter: schema.user.name })
    .from(schema.invitation)
    .innerJoin(schema.organization, eq(schema.organization.id, schema.invitation.organizationId))
    .leftJoin(schema.user, eq(schema.user.id, schema.invitation.inviterId))
    .where(eq(schema.invitation.id, id));

  if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
    return (
      <AuthCard title="This invitation is no longer valid" description="It was used, cancelled or has expired. Ask the person who invited you for a new one.">
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Go to the home page</Link>
        </Button>
      </AuthCard>
    );
  }

  const session = await getSession();
  const path = `/invite/${invite.id}`;
  const title = `Join ${invite.workspace}`;
  const description = `${invite.inviter ? `${invite.inviter} invited you` : "You were invited"} to join with the ${formatRole(invite.role)} role.`;

  if (!session) {
    return (
      <AuthCard title={title} description={description}>
        <p>Create an account or sign in with <strong className="break-all">{invite.email}</strong> to accept.</p>
        <div className="flex flex-col gap-2">
          <Button asChild><Link href={`/sign-up?next=${encodeURIComponent(path)}&email=${encodeURIComponent(invite.email)}`}>Create account</Link></Button>
          <Button asChild variant="outline"><Link href={`/sign-in?next=${encodeURIComponent(path)}`}>I already have an account</Link></Button>
        </div>
      </AuthCard>
    );
  }

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <AuthCard title={title} description={description}>
        <p>This invitation is for <strong className="break-all">{invite.email}</strong>, but you are signed in as <strong className="break-all">{session.user.email}</strong>.</p>
        <form action={signOutAction}><Button type="submit" variant="outline" className="w-full">Sign out and switch account</Button></form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={title} description={description}>
      <ActionForm action={acceptInviteAction}>
        <input type="hidden" name="invitationId" value={invite.id} />
        <SubmitButton className="w-full">Accept invitation</SubmitButton>
      </ActionForm>
      <ActionForm action={declineInviteAction}>
        <input type="hidden" name="invitationId" value={invite.id} />
        <SubmitButton variant="ghost" className="w-full">Decline</SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}
