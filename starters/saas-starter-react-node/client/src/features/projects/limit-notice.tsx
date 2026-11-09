import { Link } from "react-router";
import { Info } from "lucide-react";
import { useAppConfig, useCan, useShowSetupHints } from "@/lib/queries";
import { README_BILLING_URL } from "@/lib/links";

/** Shown at the plan's project limit, with the next step this person can actually take. */
export function ProjectLimitNotice({ planName, limit }: { planName: string; limit: number }) {
  const billingEnabled = useAppConfig().data?.billingEnabled;
  const isOwner = useCan({ billing: ["manage"] });
  const hints = useShowSetupHints();
  let next;
  if (billingEnabled && isOwner) next = <><Link to="/settings/billing" className="text-primary-text font-medium underline underline-offset-2">Upgrade your plan</Link> to add more.</>;
  else if (billingEnabled) next = "Ask the workspace owner to upgrade to add more.";
  else if (hints) next = <>Delete one to add another, or <a href={README_BILLING_URL} target="_blank" rel="noreferrer" className="text-primary-text font-medium underline underline-offset-2">turn on billing</a> so workspaces can upgrade.</>;
  else next = "Delete one to add another.";
  return (
    <p className="bg-surface mb-6 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm">
      <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
      <span>You have used all {limit} projects on the {planName} plan. {next}</span>
    </p>
  );
}
