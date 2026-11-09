import { Router } from "express";
import { and, count, eq, gt } from "drizzle-orm";
import { db } from "../db/index.ts";
import { apikey, invitation, member, organization, project, user } from "../db/schema.ts";
import { requireSession, requireWorkspace } from "../middleware/auth.ts";
import { getWorkspacePlan } from "../lib/billing.ts";
import { HttpError } from "../lib/errors.ts";
import type { WorkspaceSummary } from "../../../shared/schemas.ts";

export const workspaceRoutes = Router();

const countWhere = async (query: Promise<{ n: number }[]>) => (await query)[0]?.n ?? 0;

// Plan, role and the numbers behind the getting-started checklist.
workspaceRoutes.get("/me/workspace", requireSession, requireWorkspace(), async (_req, res) => {
  const id = res.locals.workspace.id;
  const plan = await getWorkspacePlan(id);
  const [projects, members, invitations, apiKeys] = await Promise.all([
    countWhere(db.select({ n: count() }).from(project).where(eq(project.organizationId, id))),
    countWhere(db.select({ n: count() }).from(member).where(eq(member.organizationId, id))),
    countWhere(db.select({ n: count() }).from(invitation).where(and(eq(invitation.organizationId, id), eq(invitation.status, "pending")))),
    countWhere(db.select({ n: count() }).from(apikey).where(eq(apikey.referenceId, id))),
  ]);
  const body: WorkspaceSummary = {
    plan: plan.id,
    role: res.locals.workspace.role,
    subscriptionStatus: plan.status,
    counts: { projects, members, invitations, apiKeys },
  };
  res.json(body);
});

workspaceRoutes.post("/me/onboarded", requireSession, async (_req, res) => {
  await db.update(user).set({ onboarded: true }).where(eq(user.id, res.locals.session.user.id));
  res.json({ onboarded: true });
});

// Public: the invite page shows who invited you before you sign in. The id is
// an unguessable token, and only what the page needs is returned.
workspaceRoutes.get("/invitations/:id", async (req, res) => {
  const [row] = await db
    .select({ email: invitation.email, role: invitation.role, status: invitation.status, expiresAt: invitation.expiresAt, workspace: organization.name, inviter: user.name })
    .from(invitation)
    .innerJoin(organization, eq(organization.id, invitation.organizationId))
    .innerJoin(user, eq(user.id, invitation.inviterId))
    .where(and(eq(invitation.id, req.params.id), gt(invitation.expiresAt, new Date())));
  if (!row) throw new HttpError(404, "This invitation does not exist or has expired");
  res.json(row);
});
