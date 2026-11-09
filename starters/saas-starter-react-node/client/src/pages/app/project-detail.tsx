import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Confirm } from "@/components/confirm";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/states";
import { api } from "@/lib/api";
import { formatDate, timeAgo } from "@/lib/format";
import { useCan } from "@/lib/queries";
import { ProjectForm } from "@/features/projects/project-form";
import { useProjects } from "@/features/projects/use-projects";
import type { Project, ProjectInput } from "@shared/schemas.ts";
import { Section } from "./settings/section";

export function ProjectDetail() {
  const { id } = useParams();
  const projects = useProjects();
  const project = projects.data?.find((p) => p.id === id);
  const canEdit = useCan({ project: ["update"] });
  const canDelete = useCan({ project: ["delete"] });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (input: ProjectInput) => api<Project>(`/projects/${id}`, { method: "PATCH", body: input }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["projects"] }); toast.success("Changes saved"); },
  });
  const remove = async () => {
    await api(`/projects/${id}`, { method: "DELETE" });
    await queryClient.invalidateQueries();
    toast.success(`Deleted ${project?.name ?? "the project"}`);
    navigate("/projects");
  };

  const crumbs = [{ label: "Projects", to: "/projects" }];
  if (projects.error) return <><PageHeader title="Project" breadcrumb={crumbs} /><ErrorState title="Could not load the project" error={projects.error} onRetry={() => void projects.refetch()} /></>;
  if (projects.isPending) return <PageSkeleton />;
  if (!project) {
    return (
      <>
        <PageHeader title="Project not found" breadcrumb={crumbs} />
        <EmptyState icon={FolderX} title="This project does not exist" description="It may have been deleted, or it belongs to another workspace."
          action={<Button asChild variant="outline"><Link to="/projects">Back to projects</Link></Button>} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={project.name} breadcrumb={crumbs}
        description={`Created ${formatDate(project.createdAt)} · updated ${timeAgo(project.updatedAt)}`} />
      <div className="grid grid-cols-1 gap-6">
        <Section title="Details" description={canEdit ? undefined : "Your role can view this project but not change it."}>
          <ProjectForm key={project.updatedAt} project={project} submitLabel="Save changes" disabled={!canEdit} onSubmit={(input) => update.mutateAsync(input)} />
        </Section>
        {canDelete && (
          <Section title="Delete project" danger description="Removes the project for everyone in the workspace. This cannot be undone.">
            <Confirm
              trigger={<Button variant="destructive-outline">Delete project</Button>}
              title={`Delete ${project.name}?`}
              description="This removes the project for everyone in the workspace. It cannot be undone."
              action="Delete project"
              onConfirm={remove}
            />
          </Section>
        )}
      </div>
    </>
  );
}
