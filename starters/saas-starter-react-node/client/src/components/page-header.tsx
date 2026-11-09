import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { useTitle } from "@/lib/title";

interface Props {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Tab title when it differs from the heading (e.g. "Dashboard" for a greeting). */
  docTitle?: string;
  breadcrumb?: { label: string; to: string }[];
}

export function PageHeader({ title, description, action, docTitle, breadcrumb }: Props) {
  useTitle(docTitle ?? title);
  return (
    <div className="mb-6 grid gap-3">
      {breadcrumb && (
        <nav aria-label="Breadcrumb">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-[0.8125rem]">
            {breadcrumb.map((b) => (
              <li key={b.to} className="flex items-center gap-1">
                <Link to={b.to} className="hover:text-foreground">{b.label}</Link>
                <ChevronRight className="size-3.5" aria-hidden />
              </li>
            ))}
            <li aria-current="page" className="text-foreground max-w-[16rem] truncate">{title}</li>
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold break-words">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
