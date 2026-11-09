import type { ReactNode } from "react";
import { useTitle } from "@/lib/title";

/** The centred card every auth page uses: title, subtitle, form, then links on their own line. */
export function AuthCard({ title, description, children, footer, icon }: { title: string; description?: ReactNode; children?: ReactNode; footer?: ReactNode; icon?: ReactNode }) {
  useTitle(title);
  return (
    <div className="w-full max-w-[400px]">
      <section className="bg-card rounded-xl border p-6 sm:p-8">
        {icon && <div className="mb-4">{icon}</div>}
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </section>
      {footer && <div className="text-muted-foreground mt-6 grid justify-items-center gap-2 text-center text-sm">{footer}</div>}
    </div>
  );
}

export function IconBadge({ children }: { children: ReactNode }) {
  return <span className="bg-primary/10 text-primary-text flex size-10 items-center justify-center rounded-full [&_svg]:size-5">{children}</span>;
}
