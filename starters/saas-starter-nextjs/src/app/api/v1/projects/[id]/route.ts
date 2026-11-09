import { jsonError, withApiKey } from "@/lib/api";
import { deleteProject, getProject, updateProject } from "@/lib/projects";

type Ctx = RouteContext<"/api/v1/projects/[id]">;

export const GET = withApiKey<Ctx>(async (_req, organizationId, { params }) => {
  const project = await getProject(organizationId, (await params).id);
  return project ? Response.json({ data: project }) : jsonError(404, "Project not found.");
});

export const PATCH = withApiKey<Ctx>(async (req, organizationId, { params }) => {
  const project = await updateProject(organizationId, (await params).id, await req.json());
  return project ? Response.json({ data: project }) : jsonError(404, "Project not found.");
});

export const DELETE = withApiKey<Ctx>(async (_req, organizationId, { params }) => {
  const deleted = await deleteProject(organizationId, (await params).id);
  return deleted ? new Response(null, { status: 204 }) : jsonError(404, "Project not found.");
});
