import Link from "next/link";

export function SiteFooter({ appName }: { appName: string }) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {appName}
        </p>
        <nav aria-label="Legal" className="flex gap-4">
          <Link className="hover:text-foreground hover:underline" href="/pricing">Pricing</Link>
          <Link className="hover:text-foreground hover:underline" href="/terms">Terms</Link>
          <Link className="hover:text-foreground hover:underline" href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
