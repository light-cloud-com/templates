import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";
import { getWorkspacePlan } from "./billing";
import { config } from "./config";
import { db, schema } from "./db";

/** The signed-in session for this request, or null. Cached so layouts and pages share one lookup. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

export const isPlatformAdmin = (user: { role?: string | null; email: string }) =>
  user.role === "admin" || config.adminEmails.includes(user.email.toLowerCase());

/**
 * The signed-in user plus their active workspace and role in it. Every page and server action under
 * (app) goes through here, so role checks always see the current membership, not a stale cookie.
 */
export const requireWorkspace = cache(async () => {
  const session = await requireUser();
  const membership = async (organizationId: string) => {
    const [row] = await db
      .select({ id: schema.organization.id, name: schema.organization.name, slug: schema.organization.slug, role: schema.member.role })
      .from(schema.member)
      .innerJoin(schema.organization, eq(schema.organization.id, schema.member.organizationId))
      .where(and(eq(schema.member.userId, session.user.id), eq(schema.member.organizationId, organizationId)));
    return row;
  };

  let row = session.session.activeOrganizationId ? await membership(session.session.activeOrganizationId) : undefined;
  if (!row) {
    // No active workspace, or the user was removed from it: fall back to the first one they belong to.
    const [first] = await db
      .select({ organizationId: schema.member.organizationId })
      .from(schema.member)
      .where(eq(schema.member.userId, session.user.id))
      .orderBy(asc(schema.member.createdAt))
      .limit(1);
    if (!first) redirect("/onboarding");
    await auth.api.setActiveOrganization({ headers: await headers(), body: { organizationId: first.organizationId } });
    row = await membership(first.organizationId);
    if (!row) redirect("/onboarding");
  }

  const { role, ...workspace } = row;
  return { ...session, workspace, role, plan: await getWorkspacePlan(workspace.id) };
});

export async function listWorkspaces(userId: string) {
  return db
    .select({ id: schema.organization.id, name: schema.organization.name, role: schema.member.role })
    .from(schema.member)
    .innerJoin(schema.organization, eq(schema.organization.id, schema.member.organizationId))
    .where(eq(schema.member.userId, userId))
    .orderBy(asc(schema.organization.name));
}
