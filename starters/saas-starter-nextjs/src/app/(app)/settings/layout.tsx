import { NavLink } from "@/components/nav-link";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav aria-label="Settings" className="flex gap-1 overflow-x-auto border-b pb-2">
        <NavLink href="/settings/workspace">Workspace</NavLink>
        <NavLink href="/settings/members">Members</NavLink>
        <NavLink href="/settings/api-keys">API keys</NavLink>
        <NavLink href="/settings/billing">Billing</NavLink>
        <NavLink href="/settings/account">Account</NavLink>
      </nav>
      {children}
    </>
  );
}
