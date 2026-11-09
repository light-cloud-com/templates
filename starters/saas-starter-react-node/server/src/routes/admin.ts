import { Router } from "express";
import { count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { member, organization, user } from "../db/schema.ts";
import { requirePlatformAdmin, requireSession } from "../middleware/auth.ts";

// Read-only lists for /admin. Banning goes through Better Auth's admin plugin.
export const adminRoutes = Router();
adminRoutes.use(requireSession, requirePlatformAdmin);

const term = (q: unknown) => (typeof q === "string" && q.trim() ? `%${q.trim()}%` : null);

adminRoutes.get("/users", async (req, res) => {
  const q = term(req.query.search);
  const rows = await db
    .select({
      id: user.id, name: user.name, email: user.email, role: user.role, banned: user.banned,
      emailVerified: user.emailVerified, createdAt: user.createdAt,
      workspaces: count(member.id),
    })
    .from(user)
    .leftJoin(member, eq(member.userId, user.id))
    .where(q ? or(ilike(user.email, q), ilike(user.name, q)) : undefined)
    .groupBy(user.id)
    .orderBy(desc(user.createdAt))
    .limit(100);
  res.json(rows);
});

adminRoutes.get("/workspaces", async (req, res) => {
  const q = term(req.query.search);
  const rows = await db
    .select({
      id: organization.id, name: organization.name, slug: organization.slug, createdAt: organization.createdAt,
      members: count(member.id),
      // Spelled out with table names: drizzle leaves columns unqualified in a query without joins,
      // and "reference_id = id" inside the subquery would then compare subscription with itself.
      plan: sql<string | null>`(select s.plan from subscription s where s.reference_id = "organization"."id" and s.status in ('active','trialing') limit 1)`,
      subscriptionStatus: sql<string | null>`(select s.status from subscription s where s.reference_id = "organization"."id" order by s.period_end desc nulls last limit 1)`,
    })
    .from(organization)
    .leftJoin(member, eq(member.organizationId, organization.id))
    .where(q ? or(ilike(organization.name, q), ilike(organization.slug, q)) : undefined)
    .groupBy(organization.id)
    .orderBy(desc(organization.createdAt))
    .limit(100);
  res.json(rows.map((r) => ({ ...r, plan: r.plan ?? "free" })));
});
