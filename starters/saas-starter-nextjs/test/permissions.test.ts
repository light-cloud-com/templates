import { describe, expect, it } from "vitest";
import { assertCan, can, ForbiddenError } from "@/lib/permissions";

describe("workspace permissions", () => {
  it("lets every role use the app", () => {
    for (const role of ["owner", "admin", "member"]) expect(can(role, "project:write")).toBe(true);
  });

  it("keeps billing and deletion with owners", () => {
    expect(can("owner", "billing:manage")).toBe(true);
    expect(can("owner", "workspace:delete")).toBe(true);
    expect(can("admin", "billing:manage")).toBe(false);
    expect(can("admin", "workspace:delete")).toBe(false);
  });

  it("lets admins, not members, manage members, settings and keys", () => {
    for (const action of ["member:manage", "workspace:update", "apiKey:manage"] as const) {
      expect(can("admin", action)).toBe(true);
      expect(can("member", action)).toBe(false);
    }
  });

  it("reads Better Auth's comma-separated roles and rejects unknown ones", () => {
    expect(can("member, owner", "billing:manage")).toBe(true);
    expect(can("guest", "project:read")).toBe(false);
    expect(can(null, "project:read")).toBe(false);
    expect(() => assertCan("member", "apiKey:manage")).toThrow(ForbiddenError);
  });
});
