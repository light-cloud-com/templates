import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { client, startApp } from "./helpers.ts";

// Runs against a real PostgreSQL when DATABASE_URL is set (see README).
const id = Date.now().toString(36);
const ownerEmail = `owner-${id}@example.com`;
process.env.ADMIN_EMAILS = ownerEmail;

describe.runIf(!!process.env.DATABASE_URL)("sign-up to API key to projects", () => {
  let app: Awaited<ReturnType<typeof startApp>>;

  beforeAll(async () => {
    const { runMigrations } = await import("../src/db/migrate.ts");
    await runMigrations();
    await runMigrations(); // idempotent
    app = await startApp();
  });
  afterAll(() => app?.close());

  it("creates a workspace, an API key and projects up to the Free limit", async () => {
    const owner = client(app.base);
    expect((await owner("/api/health")).status).toBe(200);

    const signUp = await owner("/api/auth/sign-up/email", { body: { name: "Owner", email: ownerEmail, password: "password123" } });
    expect(signUp.status).toBe(200);
    expect(signUp.json.user.role).toBe("admin"); // listed in ADMIN_EMAILS

    const org = await owner("/api/auth/organization/create", { body: { name: "Test Co", slug: `test-${id}` } });
    expect(org.status).toBe(200);
    expect((await owner("/api/me/workspace")).json).toMatchObject({ plan: "free", role: "owner" });

    const created = await owner("/api/auth/api-key/create", { body: { name: "test", organizationId: org.json.id } });
    expect(created.status).toBe(200);
    const key: string = created.json.key;
    expect(key.startsWith("sk_")).toBe(true);

    const api = client(app.base);
    const auth = { authorization: `Bearer ${key}` };
    for (const name of ["One", "Two", "Three"]) {
      const res = await api("/api/v1/projects", { body: { name }, headers: auth });
      expect(res.status).toBe(201);
      expect(res.json.data).toMatchObject({ name, organizationId: org.json.id });
    }
    const over = await api("/api/v1/projects", { body: { name: "Four" }, headers: auth });
    expect(over.status).toBe(402);

    const list = await api("/api/v1/projects", { headers: auth });
    expect(list.status).toBe(200);
    expect(list.json.data).toHaveLength(3);

    expect((await api("/api/v1/projects", { body: { name: "" }, headers: auth })).status).toBe(400);
    expect((await api("/api/v1/projects", { headers: { authorization: "Bearer sk_wrong" } })).status).toBe(401);
    expect((await api("/api/v1/projects/not-a-uuid", { headers: auth })).status).toBe(404);

    // Admin panel: allowed for the admin, refused for anyone else.
    expect((await owner("/api/admin/users")).status).toBe(200);
    const other = client(app.base);
    await other("/api/auth/sign-up/email", { body: { name: "Other", email: `other-${id}@example.com`, password: "password123" } });
    expect((await other("/api/admin/users")).status).toBe(403);
    // ...and cannot read another workspace's projects.
    expect((await other("/api/projects")).status).toBe(400);
  });

  it("blocks cookie-authenticated writes from another origin", async () => {
    const res = await fetch(`${app.base}/api/projects`, { method: "POST", headers: { origin: "https://evil.example", "content-type": "application/json" }, body: "{}" });
    expect(res.status).toBe(403);
  });
});
