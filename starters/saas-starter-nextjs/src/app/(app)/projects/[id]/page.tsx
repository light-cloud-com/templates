import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/confirm-action";
import { ActionForm, Field, SubmitButton, TextareaField } from "@/components/form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, timeAgo } from "@/lib/format";
import { can } from "@/lib/permissions";
import { getProject } from "@/lib/projects";
import { requireWorkspace } from "@/lib/session";
import { limits } from "@/lib/validation";
import { deleteProjectAction, updateProjectAction } from "../actions";

export async function generateMetadata({ params }: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { workspace } = await requireWorkspace();
  const project = await getProject(workspace.id, (await params).id);
  return { title: project ? project.name : "Project not found" };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
  const { workspace, role } = await requireWorkspace();
  const project = await getProject(workspace.id, (await params).id);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={project.name}
        breadcrumb={[{ label: "Projects", href: "/projects" }]}
        description={`Created ${formatDate(project.createdAt)} · updated ${timeAgo(project.updatedAt)}`}
      />
      <Card>
        <CardHeader>
          <CardTitle><h2>Details</h2></CardTitle>
          <CardDescription>Everyone in {workspace.name} can see and edit this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={updateProjectAction} className="max-w-xl">
            <input type="hidden" name="id" value={project.id} />
            <Field label="Name" name="name" defaultValue={project.name} required maxLength={limits.projectName} />
            <TextareaField label="Description" name="description" defaultValue={project.description} maxLength={limits.projectDescription} rows={4} />
            <SubmitButton>Save changes</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle><h2>Delete project</h2></CardTitle>
          <CardDescription>
            {can(role, "project:delete") ? "Removes the project for everyone in the workspace. This cannot be undone." : "Only owners and admins can delete projects."}
          </CardDescription>
        </CardHeader>
        {can(role, "project:delete") && (
          <CardContent>
            <ConfirmAction
              trigger={<Button variant="destructive-outline">Delete project</Button>}
              action={deleteProjectAction}
              fields={{ id: project.id, from: "detail" }}
              title={`Delete ${project.name}?`}
              description="The project is removed for everyone in the workspace. This cannot be undone."
              confirmLabel="Delete project"
            />
          </CardContent>
        )}
      </Card>
    </>
  );
}
