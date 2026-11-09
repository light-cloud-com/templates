import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq } from "drizzle-orm";
import { auth, type Session } from "../lib/auth.ts";
import { db } from "../db/index.ts";
import { member, organization } from "../db/schema.ts";
import { can, type Permission } from "../../../shared/permissions.ts";
import { HttpError } from "../lib/errors.ts";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      session: Session;
      workspace: { id: string; role: string };
    }
  }
}

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return next(new HttpError(401, "Sign in first"));
  res.locals.session = session;
  next();
}

/** The session's active workspace, with the caller's role checked on every request. */
export function requireWorkspace(permission?: Permission) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const { session, user } = res.locals.session;
    const workspaceId = session.activeOrganizationId;
    if (!workspaceId) return next(new HttpError(400, "Choose a workspace first", "no_workspace"));
    const [m] = await db.select({ role: member.role }).from(member)
      .where(and(eq(member.organizationId, workspaceId), eq(member.userId, user.id)));
    if (!m) return next(new HttpError(403, "You are not a member of this workspace"));
    if (permission && !can(m.role, permission)) return next(new HttpError(403, "Your role does not allow this"));
    res.locals.workspace = { id: workspaceId, role: m.role };
    next();
  };
}

export function requirePlatformAdmin(_req: Request, res: Response, next: NextFunction) {
  if (res.locals.session.user.role !== "admin") return next(new HttpError(403, "Admins only"));
  next();
}

/** `Authorization: Bearer <key>` for the public API. The key belongs to one workspace. */
export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!key) return next(new HttpError(401, "Send your API key as Authorization: Bearer <key>"));
  const result = await auth.api.verifyApiKey({ body: { key } });
  if (!result.valid || !result.key) {
    const limited = result.error?.code === "RATE_LIMITED";
    return next(new HttpError(limited ? 429 : 401, limited ? "Too many requests" : "Invalid API key"));
  }
  const [org] = await db.select({ id: organization.id }).from(organization).where(eq(organization.id, result.key.referenceId));
  if (!org) return next(new HttpError(401, "Invalid API key"));
  res.locals.workspace = { id: org.id, role: "api" };
  next();
}
