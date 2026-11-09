import { NavLink, Outlet } from "react-router";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "account", label: "Account" },
  { to: "workspace", label: "Workspace" },
  { to: "members", label: "Members" },
  { to: "api-keys", label: "API keys" },
  { to: "billing", label: "Billing" },
];

export function SettingsLayout() {
  return (
    <>
      <PageHeader title="Settings" />
      <nav aria-label="Settings" className="mb-6 flex gap-1 overflow-x-auto border-b">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to}
            className={({ isActive }) => cn("text-muted-foreground hover:text-foreground -mb-px border-b-2 border-transparent px-3 py-2 text-sm whitespace-nowrap", isActive && "border-primary text-foreground font-medium")}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <div className="grid gap-6"><Outlet /></div>
    </>
  );
}
