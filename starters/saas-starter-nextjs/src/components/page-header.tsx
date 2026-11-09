import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function PageHeader({
  title,
  description,
  breadcrumb,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  /** Parent pages, e.g. [{ label: "Projects", href: "/projects" }]. */
  breadcrumb?: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {breadcrumb && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {breadcrumb.map((b) => (
              <li key={b.href} className="flex items-center gap-1">
                <Link href={b.href} className="rounded-sm hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                  {b.label}
                </Link>
                <ChevronRight className="size-3.5" aria-hidden />
              </li>
            ))}
            <li aria-current="page" className="max-w-[60vw] truncate text-foreground">{title}</li>
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold break-words">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
