import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormError, SubmitButton } from "@/components/field";
import { authClient, unwrap } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";
import { inviteInput } from "@shared/schemas.ts";
import { usePendingInvitations } from "./use-invitations";

/** Invites by email. Inviting someone who already has an invitation resends it. */
export function InviteForm({ organizationId }: { organizationId: string }) {
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const pending = usePendingInvitations(organizationId).data;
  const queryClient = useQueryClient();
  const [role, setRole] = useState<"member" | "admin">("member");
  const [error, setError] = useState<{ email?: string; form?: string }>({});
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = inviteInput.safeParse({ email: String(new FormData(form).get("invite-email") ?? "").trim(), role });
    if (!parsed.success) return setError({ email: parsed.error.issues[0]?.message });
    const email = parsed.data.email.toLowerCase();
    const resend = !!pending?.some((i) => i.email.toLowerCase() === email);
    setError({});
    setSending(true);
    try {
      await unwrap(authClient.organization.inviteMember({ ...parsed.data, email, organizationId, resend }));
      if (resend) toast.success(emailEnabled ? `Invite resent to ${email}` : `Invite resent. The link for ${email} works for another 7 days.`);
      else toast.success(emailEnabled ? `Invitation sent to ${email}` : `Invitation created for ${email}. Copy its link below to share it.`);
      form.reset();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["invitations", organizationId] }),
        queryClient.invalidateQueries({ queryKey: ["workspace"] }),
      ]);
    } catch (err) {
      setError({ form: (err as Error).message });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3">
      <FormError message={error.form} />
      <div className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-start">
        <Field label="Email" id="invite-email" type="email" placeholder="teammate@example.com" autoComplete="off" maxLength={254} required error={error.email} />
        <div className="grid gap-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as "member" | "admin")}>
            <SelectTrigger id="invite-role" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SubmitButton pending={sending} className="sm:mt-[1.375rem]">Send invite</SubmitButton>
      </div>
    </form>
  );
}
