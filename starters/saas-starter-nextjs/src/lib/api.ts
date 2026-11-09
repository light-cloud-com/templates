import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hashApiKey, readBearerKey } from "./api-keys";
import { db, schema } from "./db";
import { PlanLimitError } from "./plans";

export const jsonError = (status: number, error: string) => NextResponse.json({ error }, { status });

/** The workspace a request's `Authorization: Bearer <key>` belongs to, or null. */
export async function workspaceFromKey(request: Request) {
  const key = readBearerKey(request.headers.get("authorization"));
  if (!key) return null;
  const [row] = await db
    .update(schema.apiKey)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.apiKey.keyHash, hashApiKey(key)))
    .returning({ organizationId: schema.apiKey.organizationId });
  return row?.organizationId ?? null;
}

/** Wraps a v1 handler: checks the API key, maps validation and plan errors to JSON. */
export function withApiKey<C>(handler: (req: Request, organizationId: string, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    const organizationId = await workspaceFromKey(req);
    if (!organizationId) return jsonError(401, "Missing or invalid API key. Send Authorization: Bearer <key>.");
    try {
      return await handler(req, organizationId, ctx);
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, err.issues[0]?.message ?? "Invalid input.");
      if (err instanceof PlanLimitError) return jsonError(402, err.message);
      if (err instanceof SyntaxError) return jsonError(400, "Body must be JSON.");
      throw err;
    }
  };
}
