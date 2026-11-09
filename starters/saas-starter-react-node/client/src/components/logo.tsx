import { Link } from "react-router";
import { useAppConfig } from "@/lib/queries";

export function Logo({ to = "/" }: { to?: string }) {
  const name = useAppConfig().data?.appName ?? "Acme";
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2 rounded-md text-[0.9375rem] font-semibold tracking-tight">
      <svg aria-hidden viewBox="0 0 32 32" className="size-7">
        <rect width="32" height="32" rx="8" className="fill-primary" />
        <path d="M9 22 16 9l7 13z" className="fill-primary-foreground" />
      </svg>
      {name}
    </Link>
  );
}
