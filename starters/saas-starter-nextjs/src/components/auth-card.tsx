import Link from "next/link";

/** The card every auth page sits in: title, subtitle, content, then secondary links underneath. */
export function AuthCard({ title, description, children, footer }: { title: string; description?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-6 sm:p-8">
        <div className="mb-6 space-y-1.5">
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="space-y-5 text-sm">{children}</div>
      </div>
      {footer && <div className="space-y-2 text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}

export function TextLink(props: React.ComponentProps<typeof Link>) {
  return <Link {...props} className="font-medium text-link underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none" />;
}
