import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { api } from "@/lib/api";
import type { Project, ProjectInput } from "@shared/schemas.ts";
import { Confirm } from "@/components/confirm";
import { ProjectForm } from "@/features/projects/project-form";
import { useProjects } from "@/features/projects/use-projects";

export function ProjectDetail() {
  const { id } = useParams();
  const { data: projects, isPending } = useProjects();
  const project = projects?.find((p) => p.id === id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (input: ProjectInput) => api<Project>(`/projects/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["projects"] }); toast.success("Saved"); },
  });
  const remove = useMutation({
    mutationFn: () => api(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: async () => { await queryClient.invalidateQueries(); toast.success("Project deleted"); navigate("/projects"); },
    onError: (err) => toast.error(err.message),
  });

  if (isPending) return <Spinner />;
  if (!project) return <PageHeader title="Project not found" action={<Button asChild variant="outline"><Link to="/projects">Back to projects</Link></Button>} />;

  return (
    <>
      <Link to="/projects" className="text-muted-foreground mb-4 inline-flex items-center gap-1 text-sm hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Projects
      </Link>
      <PageHeader title={project.name} description={`Created ${new Date(project.createdAt).toLocaleDateString()}`} />
      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle><h2>Details</h2></CardTitle></CardHeader>
          <CardContent><ProjectForm key={project.updatedAt} project={project} submitLabel="Save changes" onSubmit={(input) => update.mutateAsync(input)} /></CardContent>
        </Card>
        <Card className="border-destructive/40">
          <CardHeader><CardTitle><h2>Delete project</h2></CardTitle></CardHeader>
          <CardContent>
            <Confirm
              trigger={<Button variant="destructive">Delete project</Button>}
              title={`Delete ${project.name}?`}
              description="This removes the project for everyone in the workspace. It cannot be undone."
              action="Delete"
              onConfirm={() => remove.mutate()}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
