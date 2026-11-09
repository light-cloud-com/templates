import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { project } from "../db/schema.ts";
import { z } from "zod";
import { projectInput, projectPatch, type ProjectInput, type ProjectPatch } from "../../../shared/schemas.ts";
import { withinLimit } from "../../../shared/plans.ts";
import { getWorkspacePlan } from "./billing.ts";
import { HttpError } from "./errors.ts";

// A malformed id can never match; checking it first keeps Postgres from erroring on the cast.
function assertId(id: string) {
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Project not found");
}

// Used by both the app (session) and the public API (API key).
export function listProjects(organizationId: string) {
  return db.select().from(project).where(eq(project.organizationId, organizationId)).orderBy(desc(project.createdAt));
}

export async function getProject(organizationId: string, id: string) {
  assertId(id);
  const [row] = await db.select().from(project).where(and(eq(project.id, id), eq(project.organizationId, organizationId)));
  if (!row) throw new HttpError(404, "Project not found");
  return row;
}

export async function createProject(organizationId: string, userId: string | null, input: ProjectInput) {
  const data = projectInput.parse(input);
  const plan = await getWorkspacePlan(organizationId);
  const [{ n }] = (await db.select({ n: count() }).from(project).where(eq(project.organizationId, organizationId))) as [{ n: number }];
  // shortcut: count-then-insert can overshoot by one under concurrent creates; use a DB constraint if that matters.
  if (!withinLimit(plan.limits.projects, n)) {
    throw new HttpError(402, `The ${plan.name} plan allows ${plan.limits.projects} projects. Upgrade to add more.`, "plan_limit");
  }
  const [row] = await db.insert(project).values({ organizationId, createdById: userId, ...data }).returning();
  return row!;
}

export async function updateProject(organizationId: string, id: string, input: ProjectPatch) {
  assertId(id);
  const data = projectPatch.parse(input);
  const [row] = await db.update(project).set(data)
    .where(and(eq(project.id, id), eq(project.organizationId, organizationId))).returning();
  if (!row) throw new HttpError(404, "Project not found");
  return row;
}

export async function deleteProject(organizationId: string, id: string) {
  assertId(id);
  const rows = await db.delete(project).where(and(eq(project.id, id), eq(project.organizationId, organizationId))).returning({ id: project.id });
  if (rows.length === 0) throw new HttpError(404, "Project not found");
}
