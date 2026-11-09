import { Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { PageHeader } from "@/components/page-header";
import { ListSkeleton } from "@/components/states";
import { useCan } from "@/lib/queries";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = { account: "Account", workspace: "Workspace", members: "Members", "api-keys": "API keys", billing: "Billing" };

export function SettingsLayout() {
  const canKeys = useCan({ apiKey: ["create"] });
  const tab = useLocation().pathname.split("/")[2] ?? "account";
  // Members cannot use API keys, so they do not get the tab.
  const tabs = Object.entries(labels).filter(([to]) => to !== "api-keys" || canKeys);
  return (
    <>
      <PageHeader title="Settings" docTitle={`${labels[tab] ?? "Settings"} settings`} />
      <nav aria-label="Settings" className="scroll-fade -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b">
          {tabs.map(([to, label]) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => cn(
                "text-muted-foreground hover:text-foreground -mb-px border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap",
                isActive && "border-primary text-foreground",
              )}>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="grid grid-cols-1 gap-6">
        <Suspense fallback={<ListSkeleton rows={2} />}><Outlet /></Suspense>
      </div>
    </>
  );
}
