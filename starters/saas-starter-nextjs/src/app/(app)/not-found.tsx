import { SearchX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

// notFound() from an app page (a deleted project, a wrong id) renders here, inside the app shell.
export default function AppNotFound() {
  return (
    <EmptyState icon={SearchX} title="Not found" description="This page does not exist, was deleted, or belongs to another workspace.">
      <Button asChild>
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/projects">All projects</Link>
      </Button>
    </EmptyState>
  );
}
