"use client";

import { RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Unexpected errors inside the app keep the sidebar; the details are in the server log (error.digest).
export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
  return (
    <div role="alert" className="mx-auto max-w-md rounded-lg border p-6 text-center sm:p-8">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">This page could not load. Try again, and if it keeps happening, come back in a few minutes.</p>
      {digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {digest}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => retry()}>
          <RotateCw aria-hidden /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
