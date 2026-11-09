import { Link, NavLink } from "@remix-run/react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900";

export default function SiteHeader({ siteName }: { siteName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 py-6">
      <Link to="/" className="font-bold text-blue-700">
        {siteName}
      </Link>
      <nav className="flex gap-4">
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/about" className={navLinkClass}>
          About
        </NavLink>
      </nav>
    </header>
  );
}
