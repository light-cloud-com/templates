import { withApiKey } from "@/lib/api";
import { createProject, listProjects } from "@/lib/projects";

/** GET /api/v1/projects: the workspace's projects, newest first. */
export const GET = withApiKey(async (_req, organizationId) => Response.json({ data: await listProjects(organizationId) }));

/** POST /api/v1/projects {"name", "description"?}: 201 with the project, 402 over the plan limit. */
export const POST = withApiKey(async (req, organizationId) => {
  const project = await createProject(organizationId, null, await req.json());
  return Response.json({ data: project }, { status: 201 });
});
