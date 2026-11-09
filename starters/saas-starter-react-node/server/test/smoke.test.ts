import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { client, startApp } from "./helpers.ts";

// Boots the real app with a database that cannot be reached: everything that
// does not need data must still answer, and health must say 503.
describe("smoke", () => {
  const saved = process.env.DATABASE_URL;
  let app: Awaited<ReturnType<typeof startApp>>;
  let call: ReturnType<typeof client>;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql://nobody:nothing@127.0.0.1:1/none";
    app = await startApp();
    call = client(app.base);
  });
  afterAll(async () => {
    await app.close();
    process.env.DATABASE_URL = saved;
  });

  it("reports the database as unavailable", async () => {
    const res = await call("/api/health");
    expect(res.status).toBe(503);
  });

  it("serves the public config without secrets", async () => {
    const res = await call("/api/config");
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ appName: expect.any(String), emailEnabled: false, billingEnabled: false, providers: { github: false, google: false } });
  });

  it("answers unknown API routes with JSON 404 and sends security headers", async () => {
    const res = await call("/api/nope");
    expect(res.status).toBe(404);
    expect(res.json).toEqual({ error: "Not found" });
    expect(res.headers.get("content-security-policy")).toContain("default-src 'self'");
  });

  it("requires a session or an API key", async () => {
    expect((await call("/api/projects")).status).toBe(401);
    expect((await call("/api/v1/projects")).status).toBe(401);
  });

  it.runIf(fs.existsSync("dist/client/index.html"))("falls back to index.html for client routes", async () => {
    const res = await call("/settings/members");
    expect(res.status).toBe(200);
    expect(res.text).toContain('<div id="root">');
  });
});
