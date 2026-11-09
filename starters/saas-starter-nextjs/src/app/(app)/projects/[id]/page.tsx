import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProject } from "@/lib/projects";
import { requireWorkspace } from "@/lib/session";
import { deleteProjectAction, updateProjectAction } from "../actions";

export const metadata: Metadata = { title: "Edit project" };

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { workspace } = await requireWorkspace();
  const project = await getProject(workspace.id, (await params).id);
  if (!project) notFound();

  return (
    <>
      <Link href="/projects" className="text-sm text-primary underline-offset-4 hover:underline">← All projects</Link>
      <PageHeader title={project.name} description={`Created ${project.createdAt.toLocaleDateString("en")}`} />
      <Card>
        <CardHeader><CardTitle><h2>Details</h2></CardTitle></CardHeader>
        <CardContent>
          <ActionForm action={updateProjectAction}>
            <input type="hidden" name="id" value={project.id} />
            <Field label="Name" name="name" defaultValue={project.name} required maxLength={100} />
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={project.description} maxLength={1000} rows={3} />
            </div>
            <SubmitButton>Save</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
      <Card className="border-destructive/50">
        <CardHeader><CardTitle><h2>Delete project</h2></CardTitle></CardHeader>
        <CardContent>
          <ActionForm action={deleteProjectAction}>
            <input type="hidden" name="id" value={project.id} />
            <p className="text-sm text-muted-foreground">This cannot be undone.</p>
            <SubmitButton variant="destructive">Delete project</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
    </>
  );
}
