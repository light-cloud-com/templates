import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { MailX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormError } from "@/components/field";
import { api } from "@/lib/api";
import { authClient, useSession } from "@/lib/auth-client";
import { AuthCard, IconBadge } from "./auth-card";

interface Invitation { email: string; role: string; status: string; workspace: string; inviter: string }

export function AcceptInvite() {
  const { id = "" } = useParams();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const invite = useQuery({ queryKey: ["invitation", id], queryFn: () => api<Invitation>(`/invitations/${id}`), retry: false });

  if (invite.isPending || isPending) return <div className="w-full max-w-[400px]"><Skeleton className="h-56 rounded-xl" /></div>;
  if (invite.error) {
    return (
      <AuthCard icon={<IconBadge><MailX aria-hidden /></IconBadge>} title="Invitation not found" description={invite.error.message}>
        <Button asChild className="w-full"><Link to={session ? "/dashboard" : "/"}>{session ? "Open the dashboard" : "Go to the home page"}</Link></Button>
      </AuthCard>
    );
  }
  const inv = invite.data;
  const here = `/invite/${id}`;
  const title = `Join ${inv.workspace}`;
  const icon = <IconBadge><Users aria-hidden /></IconBadge>;
  const description = <><strong className="text-foreground">{inv.inviter}</strong> invited {inv.email} to join as {inv.role === "admin" ? "an admin" : "a member"}.</>;

  if (inv.status !== "pending") {
    return (
      <AuthCard icon={icon} title={title} description={`This invitation was already ${inv.status}.`}>
        <Button asChild className="w-full"><Link to="/dashboard">Open the dashboard</Link></Button>
      </AuthCard>
    );
  }

  if (!session) {
    return (
      <AuthCard icon={icon} title={title} description={description}>
        <div className="grid gap-2">
          <Button asChild><Link to={`/sign-up?email=${encodeURIComponent(inv.email)}&next=${encodeURIComponent(here)}`}>Create an account</Link></Button>
          <Button asChild variant="outline"><Link to={`/sign-in?next=${encodeURIComponent(here)}`}>I already have an account</Link></Button>
        </div>
      </AuthCard>
    );
  }

  if (session.user.email.toLowerCase() !== inv.email.toLowerCase()) {
    return (
      <AuthCard icon={icon} title={title} description={`This invitation is for ${inv.email}, but you are signed in as ${session.user.email}.`}>
        <Button variant="outline" className="w-full" onClick={() => authClient.signOut().then(() => window.location.reload())}>Sign out and switch account</Button>
      </AuthCard>
    );
  }

  async function respond(accept: boolean) {
    setError(null);
    setBusy(accept ? "accept" : "decline");
    if (!accept) {
      const { error } = await authClient.organization.rejectInvitation({ invitationId: id });
      setBusy(null);
      return error ? setError(error.message ?? "Something went wrong") : navigate("/dashboard");
    }
    const { data, error } = await authClient.organization.acceptInvitation({ invitationId: id });
    if (error || !data) { setBusy(null); return setError(error?.message ?? "Something went wrong"); }
    // Joining a workspace replaces the onboarding a new user would otherwise see.
    await api("/me/onboarded", { method: "POST" });
    await authClient.organization.setActive({ organizationId: data.member.organizationId });
    window.location.assign("/dashboard");
  }

  return (
    <AuthCard icon={icon} title={title} description={description}>
      <div className="grid gap-2">
        <FormError message={error} />
        <Button onClick={() => respond(true)} disabled={!!busy}>{busy === "accept" ? "Joining…" : "Accept invitation"}</Button>
        <Button variant="ghost" onClick={() => respond(false)} disabled={!!busy}>Decline</Button>
      </div>
    </AuthCard>
  );
}
