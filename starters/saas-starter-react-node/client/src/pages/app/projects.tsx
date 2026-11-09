import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/states";
import { api } from "@/lib/api";
import { formatDate, timeAgo } from "@/lib/format";
import { useWorkspace } from "@/lib/queries";
import { ProjectForm } from "@/features/projects/project-form";
import { ProjectLimitNotice } from "@/features/projects/limit-notice";
import { useProjects } from "@/features/projects/use-projects";
import { getPlan, withinLimit } from "@shared/plans.ts";
import type { Project, ProjectInput } from "@shared/schemas.ts";

export function Projects() {
  const projects = useProjects();
  const { data: ws } = useWorkspace();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  // /projects?new=1 (from the dashboard) opens the dialog straight away.
  const [open, setOpen] = useState(() => !!params.get("new"));
  const create = useMutation({
    mutationFn: (input: ProjectInput) => api<Project>("/projects", { method: "POST", body: input }),
    onSuccess: async (p) => {
      await queryClient.invalidateQueries();
      setOpen(false);
      toast.success(`Created ${p.name}`);
    },
  });

  const plan = getPlan(ws?.plan);
  const limit = plan.limits.projects;
  const count = projects.data?.length ?? ws?.counts.projects ?? 0;
  const full = ws ? !withinLimit(limit, count) : false;

  useEffect(() => {
    if (params.get("new")) setParams({}, { replace: true });
  }, [params, setParams]);

  const newButton = (
    <Dialog open={open && !full && !!ws} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={full || !ws}><Plus aria-hidden /> New project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Projects belong to the whole workspace.</DialogDescription>
        </DialogHeader>
        <ProjectForm submitLabel="Create project" onSubmit={(input) => create.mutateAsync(input)} />
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <PageHeader
        title="Projects"
        description={!ws ? " " : limit === null ? `${count} projects · unlimited on the ${plan.name} plan` : `${count} of ${limit} on the ${plan.name} plan`}
        action={newButton}
      />
      {full && limit !== null && <ProjectLimitNotice planName={plan.name} limit={limit} />}
      {projects.error ? (
        <ErrorState title="Could not load projects" error={projects.error} onRetry={() => void projects.refetch()} />
      ) : projects.isPending ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading">
          {[0, 1, 2].map((i) => <li key={i}><Skeleton className="h-32 rounded-xl" /></li>)}
        </ul>
      ) : projects.data.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project. Everyone in the workspace can see it."
          action={<Button onClick={() => setOpen(true)} disabled={full}><Plus aria-hidden /> New project</Button>} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.data.map((p) => (
            <li key={p.id}>
              <Link to={`/projects/${p.id}`}
                className="bg-card hover:border-foreground/20 hover:bg-surface focus-visible:ring-ring/50 flex h-full flex-col rounded-xl border p-5 outline-none transition-colors focus-visible:ring-3">
                <span className="flex items-center gap-2.5">
                  <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md"><FolderKanban className="size-4" aria-hidden /></span>
                  <span className="truncate font-semibold">{p.name}</span>
                </span>
                <span className="text-muted-foreground mt-3 line-clamp-2 flex-1 text-sm">{p.description || "No description"}</span>
                <span className="text-muted-foreground mt-4 text-xs" title={`Created ${formatDate(p.createdAt)}`}>Updated {timeAgo(p.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
