import { NavLink } from "@/components/nav-link";
import { PageHeader } from "@/components/page-header";
import { can } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { workspace, role } = await requireWorkspace();
  // Tabs a role cannot use are left out (members do not manage API keys).
  const tabs = [
    { href: "/settings/workspace", label: "Workspace" },
    { href: "/settings/members", label: "Members" },
    ...(can(role, "apiKey:manage") ? [{ href: "/settings/api-keys", label: "API keys" }] : []),
    { href: "/settings/billing", label: "Billing" },
    { href: "/settings/account", label: "Account" },
  ];
  return (
    <>
      <PageHeader title="Settings" description={`Manage ${workspace.name} and your account.`} />
      <nav aria-label="Settings" className="scroll-fade -mt-2 flex gap-6 overflow-x-auto border-b pr-6">
        {tabs.map((t) => (
          <NavLink key={t.href} href={t.href} variant="tab">
            {t.label}
          </NavLink>
        ))}
      </nav>
      {children}
    </>
  );
}
