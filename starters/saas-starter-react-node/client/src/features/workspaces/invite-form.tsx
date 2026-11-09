import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormError } from "@/components/field";
import { authClient, unwrap } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";
import { inviteInput } from "@shared/schemas.ts";

export function InviteForm({ organizationId, onInvited }: { organizationId: string; onInvited?: () => void }) {
  const emailEnabled = useAppConfig().data?.emailEnabled;
  const [role, setRole] = useState<"member" | "admin">("member");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = inviteInput.safeParse({ email: new FormData(form).get("invite-email"), role });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid input");
    setError(null);
    try {
      await unwrap(authClient.organization.inviteMember({ ...parsed.data, organizationId }));
      toast.success(emailEnabled ? `Invitation sent to ${parsed.data.email}` : "Invitation created. Copy its link from the list to share it.");
      form.reset();
      onInvited?.();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
      <Field label="Email" id="invite-email" type="email" placeholder="teammate@example.com" required />
      <div className="grid gap-2">
        <Label htmlFor="invite-role">Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as "member" | "admin")}>
          <SelectTrigger id="invite-role" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Invite</Button>
      <div className="sm:col-span-3"><FormError message={error} /></div>
    </form>
  );
}
