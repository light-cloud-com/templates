import { and, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getWorkspacePlan } from "./billing";
import { db, schema } from "./db";
import { PlanLimitError, withinLimit } from "./plans";
import { limits } from "./validation";

// Project data access, shared by the dashboard's server actions and the REST API. Every query is
// scoped by organizationId, so one workspace can never read or change another's projects.
export const projectInput = z.object({
  name: z.string().trim().min(1, "Name your project").max(limits.projectName, `Name must be ${limits.projectName} characters or fewer`),
  description: z.string().trim().max(limits.projectDescription, `Description must be ${limits.projectDescription} characters or fewer`).default(""),
});
export const projectPatch = projectInput.partial();

const { project } = schema;

export function listProjects(organizationId: string) {
  return db.select().from(project).where(eq(project.organizationId, organizationId)).orderBy(desc(project.createdAt));
}

export async function getProject(organizationId: string, id: string) {
  const [row] = await db.select().from(project).where(and(eq(project.organizationId, organizationId), eq(project.id, id)));
  return row;
}

export async function countProjects(organizationId: string) {
  const [{ n }] = await db.select({ n: count() }).from(project).where(eq(project.organizationId, organizationId));
  return n;
}

export async function createProject(organizationId: string, createdBy: string | null, input: z.input<typeof projectInput>) {
  const data = projectInput.parse(input);
  const plan = await getWorkspacePlan(organizationId);
  return db.transaction(async (tx) => {
    // Lock the workspace row so two concurrent creates cannot both slip under the plan limit.
    await tx.execute(sql`select 1 from ${schema.organization} where ${schema.organization.id} = ${organizationId} for update`);
    const [{ n }] = await tx.select({ n: count() }).from(project).where(eq(project.organizationId, organizationId));
    if (!withinLimit(plan, "projects", n)) throw new PlanLimitError("projects", plan);
    const [row] = await tx.insert(project).values({ ...data, organizationId, createdBy }).returning();
    return row;
  });
}

export async function updateProject(organizationId: string, id: string, input: z.input<typeof projectPatch>) {
  const data = projectPatch.parse(input);
  const [row] = await db
    .update(project)
    .set(data)
    .where(and(eq(project.organizationId, organizationId), eq(project.id, id)))
    .returning();
  return row;
}

export async function deleteProject(organizationId: string, id: string) {
  const [row] = await db
    .delete(project)
    .where(and(eq(project.organizationId, organizationId), eq(project.id, id)))
    .returning({ id: project.id });
  return row;
}
