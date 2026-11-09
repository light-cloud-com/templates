"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useFieldError } from "@/components/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRole } from "@/lib/format";
import { updateRoleAction } from "./actions";

/** A member's role, saved as soon as it changes. */
export function RoleSelect({ memberId, role, roles, name }: { memberId: string; role: string; roles: string[]; name: string }) {
  const [value, setValue] = useState(role);
  const [pending, startTransition] = useTransition();
  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(next) => {
        const previous = value;
        setValue(next);
        startTransition(async () => {
          const form = new FormData();
          form.set("memberId", memberId);
          form.set("role", next);
          const result = await updateRoleAction(null, form);
          if (result?.ok) toast.success(`${name} is now ${formatRole(next)}`);
          else {
            setValue(previous);
            toast.error(result?.error ?? "Could not change the role.");
          }
        });
      }}
    >
      <SelectTrigger size="sm" className="w-28" aria-label={`Role for ${name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r} value={r}>
            {formatRole(r)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** The role picker in the invite form; submits as `role`. */
export function InviteRoleSelect({ roles }: { roles: string[] }) {
  const error = useFieldError("role");
  return (
    <div className="space-y-2">
      <Label htmlFor="invite-role">Role</Label>
      <Select name="role" defaultValue="member">
        <SelectTrigger id="invite-role" className="sm:w-32" aria-invalid={error ? true : undefined}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r} value={r}>
              {formatRole(r)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
