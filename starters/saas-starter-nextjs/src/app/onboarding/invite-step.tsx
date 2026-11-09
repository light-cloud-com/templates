"use client";

import Link from "next/link";
import { useState } from "react";
import { inviteMemberAction } from "@/app/(app)/settings/members/actions";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Button } from "@/components/ui/button";
import { limits } from "@/lib/validation";

/** Optional invites. "Skip for now" turns into "Continue" once someone has been invited. */
export function InviteStep({ nextHref }: { nextHref: string }) {
  const [sent, setSent] = useState(0);
  return (
    <div className="space-y-6">
      <ActionForm action={inviteMemberAction} resetOnSuccess onSuccess={() => setSent((n) => n + 1)}>
        <input type="hidden" name="role" value="member" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Field label="Teammate's email" name="email" type="email" placeholder="name@example.com" autoComplete="off" maxLength={limits.email} required />
          </div>
          <SubmitButton variant="outline" className="sm:mt-[22px]">Send invite</SubmitButton>
        </div>
      </ActionForm>
      <div className="flex items-center justify-between gap-2 border-t pt-6">
        <p className="text-xs text-muted-foreground">{sent ? `${sent} invited. Add more or continue.` : "You can invite people later from Settings."}</p>
        <Button asChild variant={sent ? "default" : "ghost"}>
          <Link href={nextHref}>{sent ? "Continue" : "Skip for now"}</Link>
        </Button>
      </div>
    </div>
  );
}
