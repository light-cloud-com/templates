import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { api } from "@/lib/api";
import { useWorkspace } from "@/lib/queries";
import { ProjectForm } from "@/features/projects/project-form";
import { useProjects } from "@/features/projects/use-projects";
import { getPlan, withinLimit } from "@shared/plans.ts";
import type { Project, ProjectInput } from "@shared/schemas.ts";

export function Projects() {
  const { data: projects, isPending } = useProjects();
  const { data: ws } = useWorkspace();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const create = useMutation({
    mutationFn: (input: ProjectInput) => api<Project>("/projects", { method: "POST", body: input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      setOpen(false);
      toast.success("Project created");
    },
  });

  const limit = getPlan(ws?.plan).limits.projects;
  const full = ws ? !withinLimit(limit, ws.counts.projects) : false;

  return (
    <>
      <PageHeader
        title="Projects"
        description={limit === null ? "Unlimited on your plan." : `${projects?.length ?? 0} of ${limit} on your plan.`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={full}><Plus aria-hidden /> New project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New project</DialogTitle>
                <DialogDescription>Projects belong to the whole workspace.</DialogDescription>
              </DialogHeader>
              <ProjectForm submitLabel="Create project" onSubmit={(input) => create.mutateAsync(input)} />
            </DialogContent>
          </Dialog>
        }
      />
      {full && (
        <p className="bg-muted mb-4 rounded-md p-3 text-sm">
          You have reached your plan's project limit. <Link to="/settings/billing" className="underline">Upgrade</Link> to add more.
        </p>
      )}
      {isPending ? <Spinner /> : projects?.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <FolderKanban className="text-muted-foreground size-10" aria-hidden />
          <CardTitle>No projects yet</CardTitle>
          <CardDescription>Create your first project to see it here.</CardDescription>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects?.map((p) => (
            <li key={p.id}>
              <Link to={`/projects/${p.id}`} className="block rounded-xl focus-visible:outline-2">
                <Card className="hover:bg-muted/50 h-full transition-colors">
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{p.description || "No description"}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
