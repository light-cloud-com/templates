"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionState, runAction } from "@/lib/action";
import { generateApiKey } from "@/lib/api-keys";
import { db, schema } from "@/lib/db";
import { assertCan } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { limits, parseForm } from "@/lib/validation";

export async function createApiKeyAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "apiKey:manage");
    const { name } = parseForm(form, {
      name: z.string().trim().min(1, "Name the key, e.g. after where it is used").max(limits.keyName, `Key name must be ${limits.keyName} characters or fewer`),
    });
    const { key, hash, start } = generateApiKey();
    await db.insert(schema.apiKey).values({ organizationId: ctx.workspace.id, name, start, keyHash: hash, createdBy: ctx.user.id });
    revalidatePath("/", "layout");
    return { ok: `Created key "${name}"`, secret: key };
  });
}

export async function revokeApiKeyAction(_: ActionState, form: FormData): Promise<ActionState> {
  return runAction(async () => {
    const ctx = await requireWorkspace();
    assertCan(ctx.role, "apiKey:manage");
    await db
      .delete(schema.apiKey)
      .where(and(eq(schema.apiKey.id, String(form.get("id"))), eq(schema.apiKey.organizationId, ctx.workspace.id)));
    revalidatePath("/", "layout");
    return { ok: "Key revoked" };
  });
}
