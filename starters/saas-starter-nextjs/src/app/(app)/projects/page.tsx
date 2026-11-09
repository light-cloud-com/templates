import { desc, eq } from "drizzle-orm";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { type RowAction, RowActions } from "@/components/confirm-action";
import { CardList, CardListItem } from "@/components/data-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { billingEnabled } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/format";
import { can } from "@/lib/permissions";
import { getPlan, withinLimit } from "@/lib/plans";
import { requireWorkspace } from "@/lib/session";
import { deleteProjectAction } from "./actions";
import { NewProjectDialog } from "./new-project-dialog";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const { workspace, plan, role } = await requireWorkspace();
  const { project, user } = schema;
  const projects = await db
    .select({ id: project.id, name: project.name, description: project.description, createdAt: project.createdAt, updatedAt: project.updatedAt, author: user.name })
    .from(project)
    .leftJoin(user, eq(user.id, project.createdBy))
    .where(eq(project.organizationId, workspace.id))
    .orderBy(desc(project.createdAt));
  const { limits, name: planName } = getPlan(plan);
  const canAdd = withinLimit(plan, "projects", projects.length);
  const canDelete = can(role, "project:delete");
  const openNew = (await searchParams).new === "1" && canAdd;

  const actionsFor = (p: (typeof projects)[number]): RowAction[] => [
    { label: "Edit", href: `/projects/${p.id}`, icon: <Pencil aria-hidden /> },
    ...(canDelete
      ? [{
          label: "Delete",
          icon: <Trash2 aria-hidden />,
          destructive: true,
          confirm: {
            action: deleteProjectAction,
            fields: { id: p.id },
            title: `Delete ${p.name}?`,
            description: "The project is removed for everyone in the workspace. This cannot be undone.",
            confirmLabel: "Delete project",
          },
        }]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Projects"
        description={limits.projects === null ? `${projects.length} projects` : `${projects.length} of ${limits.projects} projects on the ${planName} plan`}
      >
        {canAdd ? (
          <NewProjectDialog defaultOpen={openNew} />
        ) : (
          <Button disabled>
            <Plus aria-hidden /> New project
          </Button>
        )}
      </PageHeader>

      {!canAdd && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
          <p>
            <span className="font-medium">You have used all {limits.projects} projects on the {planName} plan.</span>{" "}
            {!billingEnabled
              ? "Delete a project to add another."
              : can(role, "billing:manage")
                ? "Upgrade for more room."
                : "Ask a workspace owner to upgrade."}
          </p>
          {billingEnabled && can(role, "billing:manage") && (
            <Button asChild size="sm">
              <Link href="/settings/billing">See plans</Link>
            </Button>
          )}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project here, or add one through the REST API.">
          <NewProjectDialog label="Create a project" />
        </EmptyState>
      ) : (
        <>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Created by</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-0 w-1/2">
                      <Link href={`/projects/${p.id}`} className="block truncate font-medium hover:underline focus-visible:underline focus-visible:outline-none">
                        {p.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{p.description || "No description"}</p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{p.author ?? "API"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{timeAgo(p.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <RowActions label={`Actions for ${p.name}`} actions={actionsFor(p)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <CardList label="Projects">
            {projects.map((p) => (
              <CardListItem key={p.id} actions={<RowActions label={`Actions for ${p.name}`} actions={actionsFor(p)} />}>
                <Link href={`/projects/${p.id}`} className="block truncate font-medium hover:underline">
                  {p.name}
                </Link>
                {p.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                <p className="mt-1.5 text-xs text-muted-foreground">Updated {timeAgo(p.updatedAt)}</p>
              </CardListItem>
            ))}
          </CardList>
        </>
      )}
    </>
  );
}
