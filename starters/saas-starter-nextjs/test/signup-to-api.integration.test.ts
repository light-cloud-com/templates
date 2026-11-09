import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Runs only when DATABASE_URL points at a PostgreSQL database (see README, "Testing").
const run = process.env.DATABASE_URL ? describe : describe.skip;

run("sign-up -> workspace -> project via the API key", () => {
  let mod: {
    auth: typeof import("@/lib/auth").auth;
    db: typeof import("@/lib/db");
    keys: typeof import("@/lib/api-keys");
    list: typeof import("@/app/api/v1/projects/route");
    one: typeof import("@/app/api/v1/projects/[id]/route");
  };
  const orgIds: string[] = [];
  const emails: string[] = [];

  beforeAll(async () => {
    execFileSync("node", ["scripts/migrate.mjs"], { stdio: "inherit" });
    mod = {
      auth: (await import("@/lib/auth")).auth,
      db: await import("@/lib/db"),
      keys: await import("@/lib/api-keys"),
      list: await import("@/app/api/v1/projects/route"),
      one: await import("@/app/api/v1/projects/[id]/route"),
    };
  });

  afterAll(async () => {
    const { db, schema } = mod.db;
    const { inArray } = await import("drizzle-orm");
    if (orgIds.length) await db.delete(schema.organization).where(inArray(schema.organization.id, orgIds));
    if (emails.length) await db.delete(schema.user).where(inArray(schema.user.email, emails));
    await mod.db.pool.end();
  });

  async function signUpWithWorkspace(name: string) {
    const email = `${name}-${randomBytes(4).toString("hex")}@example.com`;
    emails.push(email);
    // Better Auth derives the app URL from the request, so direct calls carry a Host header.
    const host = { host: "localhost:3000" };
    const { headers } = await mod.auth.api.signUpEmail({
      body: { name, email, password: "a-long-password" },
      headers: new Headers(host),
      returnHeaders: true,
    });
    const cookie = headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    const org = await mod.auth.api.createOrganization({
      body: { name: `${name} Inc`, slug: `${name}-${randomBytes(4).toString("hex")}` },
      headers: new Headers({ ...host, cookie }),
    });
    orgIds.push(org!.id);
    const { key, hash, start } = mod.keys.generateApiKey();
    await mod.db.db.insert(mod.db.schema.apiKey).values({ organizationId: org!.id, name: "test", start, keyHash: hash });
    return { orgId: org!.id, key };
  }

  const call = (key: string, method = "GET", body?: unknown, path = "/api/v1/projects") =>
    new Request(`http://localhost${path}`, {
      method,
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

  it("creates, reads, updates and deletes a project, scoped to the key's workspace", async () => {
    const a = await signUpWithWorkspace("alice");
    const b = await signUpWithWorkspace("bob");

    const created = await mod.list.POST(call(a.key, "POST", { name: "Launch site" }), undefined);
    expect(created.status).toBe(201);
    const { data: project } = await created.json();
    expect(project).toMatchObject({ name: "Launch site", organizationId: a.orgId });

    const listA = await (await mod.list.GET(call(a.key), undefined)).json();
    expect(listA.data.map((p: { id: string }) => p.id)).toEqual([project.id]);

    // Another workspace's key sees nothing and cannot touch it.
    expect((await (await mod.list.GET(call(b.key), undefined)).json()).data).toEqual([]);
    expect((await mod.one.GET(call(b.key), ctx(project.id))).status).toBe(404);

    const patched = await mod.one.PATCH(call(a.key, "PATCH", { name: "Renamed" }), ctx(project.id));
    expect((await patched.json()).data.name).toBe("Renamed");

    expect((await mod.one.DELETE(call(a.key, "DELETE"), ctx(project.id))).status).toBe(204);
    expect((await mod.one.GET(call(a.key), ctx(project.id))).status).toBe(404);
  });

  it("enforces the Free plan limit and rejects bad keys and input", async () => {
    const a = await signUpWithWorkspace("carol");
    for (const name of ["one", "two", "three"]) {
      expect((await mod.list.POST(call(a.key, "POST", { name }), undefined)).status).toBe(201);
    }
    expect((await mod.list.POST(call(a.key, "POST", { name: "four" }), undefined)).status).toBe(402);
    expect((await mod.list.POST(call(a.key, "POST", { name: "" }), undefined)).status).toBe(400);
    expect((await mod.list.GET(call("sk_live_wrong"), undefined)).status).toBe(401);
  });
});
