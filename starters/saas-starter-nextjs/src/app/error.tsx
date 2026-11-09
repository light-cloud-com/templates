"use client";

import { RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Unexpected errors outside the app shell (marketing, auth, onboarding, admin).
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
  return (
    <main id="main" className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div role="alert" className="w-full max-w-md rounded-lg border bg-background p-8 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page could not load. Try again, and if it keeps happening, come back in a few minutes.</p>
        {digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {digest}</p>}
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={() => retry()}>
            <RotateCw aria-hidden /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go to the home page</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
