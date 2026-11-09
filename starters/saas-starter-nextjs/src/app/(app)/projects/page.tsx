import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPlan, withinLimit } from "@/lib/plans";
import { listProjects } from "@/lib/projects";
import { requireWorkspace } from "@/lib/session";
import { createProjectAction } from "./actions";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { workspace, plan } = await requireWorkspace();
  const projects = await listProjects(workspace.id);
  const { limits, name: planName } = getPlan(plan);
  const canAdd = withinLimit(plan, "projects", projects.length);

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} of ${limits.projects ?? "unlimited"} projects on the ${planName} plan.`}
      />
      <Card>
        <CardHeader><CardTitle><h2>New project</h2></CardTitle></CardHeader>
        <CardContent>
          {canAdd ? (
            <ActionForm action={createProjectAction} resetOnSuccess>
              <Field label="Name" name="name" required maxLength={100} />
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" maxLength={1000} rows={2} />
              </div>
              <SubmitButton>Create project</SubmitButton>
            </ActionForm>
          ) : (
            <p className="text-sm">
              You have reached the {planName} plan limit. <Link className="text-primary underline" href="/settings/billing">Upgrade</Link> to add more.
            </p>
          )}
        </CardContent>
      </Card>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet. Create one above, or through the API.</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="block p-4 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                <p className="font-medium">{p.name}</p>
                {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
