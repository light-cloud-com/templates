import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { client, startApp } from "./helpers.ts";

// Runs against a real PostgreSQL when DATABASE_URL is set (see README).
const id = `w${Date.now().toString(36)}`;
const ownerEmail = `owner-${id}@example.com`;
process.env.ADMIN_EMAILS = ownerEmail;

describe.runIf(!!process.env.DATABASE_URL)("workspaces, invitations and the admin lists", () => {
  let app: Awaited<ReturnType<typeof startApp>>;
  let owner: ReturnType<typeof client>;
  let orgA: { id: string; name: string };
  let orgB: { id: string; name: string };

  beforeAll(async () => {
    const { runMigrations } = await import("../src/db/migrate.ts");
    await runMigrations();
    app = await startApp();
    owner = client(app.base);
    await owner("/api/auth/sign-up/email", { body: { name: "Owner Person", email: ownerEmail, password: "password123" } });
    orgA = (await owner("/api/auth/organization/create", { body: { name: `Alpha ${id}`, slug: `alpha-${id}` } })).json;
    orgB = (await owner("/api/auth/organization/create", { body: { name: `Beta ${id}`, slug: `beta-${id}` } })).json;
  });
  afterAll(() => app?.close());

  it("counts each user's workspaces and reads plans from subscriptions", async () => {
    const { db } = await import("../src/db/index.ts");
    const { subscription } = await import("../src/db/schema.ts");
    await db.insert(subscription).values({ id: `sub-${id}`, plan: "pro", referenceId: orgA.id, status: "active" });

    const users = await owner(`/api/admin/users?search=${encodeURIComponent(ownerEmail)}`);
    expect(users.status).toBe(200);
    expect(users.json).toEqual([expect.objectContaining({ email: ownerEmail, workspaces: 2 })]);

    const workspaces = await owner(`/api/admin/workspaces?search=${id}`);
    const byName = Object.fromEntries(workspaces.json.map((w: { name: string }) => [w.name, w]));
    expect(byName[orgA.name]).toMatchObject({ members: 1, plan: "pro", subscriptionStatus: "active" });
    expect(byName[orgB.name]).toMatchObject({ members: 1, plan: "free", subscriptionStatus: null });

    expect((await owner("/api/admin/users?search=nobody-matches-this")).json).toEqual([]);
  });

  it("counts pending invitations towards the member limit and resends repeats", async () => {
    await owner("/api/auth/organization/set-active", { body: { organizationId: orgA.id } });
    const invite = (email: string, resend = false) =>
      owner("/api/auth/organization/invite-member", { body: { email, role: "member", organizationId: orgB.id, resend } });

    // Free allows 3 members: the owner plus two pending invitations fill it.
    const first = await invite(`a-${id}@example.com`);
    expect(first.status).toBe(200);
    expect((await invite(`b-${id}@example.com`)).status).toBe(200);
    const over = await invite(`c-${id}@example.com`);
    expect(over.status).toBe(403);
    expect(over.json.message).toContain("counting pending invitations");

    // Inviting the same address again is a resend: same invitation, no new seat.
    const again = await invite(`a-${id}@example.com`, true);
    expect(again.status).toBe(200);
    expect(again.json.id).toBe(first.json.id);

    // Cancelling one frees its seat.
    expect((await owner("/api/auth/organization/cancel-invitation", { body: { invitationId: first.json.id } })).status).toBe(200);
    expect((await invite(`c-${id}@example.com`)).status).toBe(200);
  });

  it("lets members create and edit projects but not delete them", async () => {
    const memberEmail = `member-${id}@example.com`;
    const inv = await owner("/api/auth/organization/invite-member", { body: { email: memberEmail, role: "member", organizationId: orgA.id } });
    expect(inv.status).toBe(200);

    const member = client(app.base);
    await member("/api/auth/sign-up/email", { body: { name: "Member", email: memberEmail, password: "password123" } });
    expect((await member("/api/auth/organization/accept-invitation", { body: { invitationId: inv.json.id } })).status).toBe(200);
    await member("/api/auth/organization/set-active", { body: { organizationId: orgA.id } });

    const created = await member("/api/projects", { body: { name: "Member project" } });
    expect(created.status).toBe(201);
    expect((await member(`/api/projects/${created.json.id}`, { method: "PATCH", body: { name: "Renamed" } })).json.name).toBe("Renamed");
    expect((await member(`/api/projects/${created.json.id}`, { method: "DELETE" })).status).toBe(403);
    expect((await owner(`/api/projects/${created.json.id}`, { method: "DELETE" })).status).toBe(204);
  });

  it("rejects over-long names and an email that is already taken, with readable messages", async () => {
    const longName = await client(app.base)("/api/auth/sign-up/email", { body: { name: "x".repeat(101), email: `long-${id}@example.com`, password: "password123" } });
    expect(longName.status).toBe(400);
    expect(longName.json.message).toBe("Name must be 100 characters or fewer");

    const longWorkspace = await owner("/api/auth/organization/create", { body: { name: "x".repeat(61), slug: `long-${id}` } });
    expect(longWorkspace.status).toBe(400);
    expect(longWorkspace.json.message).toBe("Workspace name must be 60 characters or fewer");

    const other = client(app.base);
    await other("/api/auth/sign-up/email", { body: { name: "Other", email: `other-${id}@example.com`, password: "password123" } });
    const taken = await other("/api/auth/change-email", { body: { newEmail: ownerEmail } });
    expect(taken.status).toBe(400);
    expect(taken.json.message).toBe("That email is already used by another account");
    // Signed out, the endpoint still refuses without saying whether the address exists.
    expect((await client(app.base)("/api/auth/change-email", { body: { newEmail: ownerEmail } })).status).toBe(401);
  });
});
