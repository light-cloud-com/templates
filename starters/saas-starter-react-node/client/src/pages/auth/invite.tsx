import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/field";
import { Spinner } from "@/components/spinner";
import { api } from "@/lib/api";
import { authClient, useSession } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

interface Invitation { email: string; role: string; status: string; workspace: string; inviter: string }

export function AcceptInvite() {
  const { id = "" } = useParams();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const invite = useQuery({ queryKey: ["invitation", id], queryFn: () => api<Invitation>(`/invitations/${id}`), retry: false });

  if (invite.isPending || isPending) return <Spinner />;
  if (invite.error) {
    return <AuthCard title="Invitation not found" description={invite.error.message}><Button asChild><Link to="/">Go home</Link></Button></AuthCard>;
  }
  const inv = invite.data;
  const here = `/invite/${id}`;
  const title = `Join ${inv.workspace}`;
  const description = `${inv.inviter} invited ${inv.email} to join as ${inv.role}.`;

  if (inv.status !== "pending") {
    return <AuthCard title={title} description={`This invitation was already ${inv.status}.`}><Button asChild><Link to="/dashboard">Open dashboard</Link></Button></AuthCard>;
  }

  if (!session) {
    return (
      <AuthCard title={title} description={description}>
        <div className="grid gap-2">
          <Button asChild><Link to={`/sign-up?email=${encodeURIComponent(inv.email)}&next=${encodeURIComponent(here)}`}>Create an account</Link></Button>
          <Button asChild variant="outline"><Link to={`/sign-in?next=${encodeURIComponent(here)}`}>I already have an account</Link></Button>
        </div>
      </AuthCard>
    );
  }

  if (session.user.email.toLowerCase() !== inv.email.toLowerCase()) {
    return (
      <AuthCard title={title} description={`This invitation is for ${inv.email}, but you are signed in as ${session.user.email}.`}>
        <Button variant="outline" onClick={() => authClient.signOut().then(() => window.location.reload())}>Sign out and switch account</Button>
      </AuthCard>
    );
  }

  async function respond(accept: boolean) {
    setError(null);
    if (!accept) {
      const { error } = await authClient.organization.rejectInvitation({ invitationId: id });
      return error ? setError(error.message ?? "Something went wrong") : navigate("/dashboard");
    }
    const { data, error } = await authClient.organization.acceptInvitation({ invitationId: id });
    if (error || !data) return setError(error?.message ?? "Something went wrong");
    // Joining a workspace replaces the onboarding a new user would otherwise see.
    await api("/me/onboarded", { method: "POST" });
    await authClient.organization.setActive({ organizationId: data.member.organizationId });
    window.location.assign("/dashboard");
  }

  return (
    <AuthCard title={title} description={description}>
      <div className="grid gap-2">
        <Button onClick={() => respond(true)}>Accept invitation</Button>
        <Button variant="ghost" onClick={() => respond(false)}>Decline</Button>
        <FormError message={error} />
      </div>
    </AuthCard>
  );
}
