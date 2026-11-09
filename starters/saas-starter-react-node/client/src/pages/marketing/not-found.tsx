import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useTitle } from "@/lib/title";

export function NotFound() {
  useTitle("Page not found");
  const signedIn = !!useSession().data;
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-primary-text text-sm font-semibold">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground mt-3">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {signedIn && <Button asChild><Link to="/dashboard">Open the dashboard</Link></Button>}
        <Button asChild variant={signedIn ? "outline" : "default"}><Link to="/">Back home</Link></Button>
      </div>
    </section>
  );
}
