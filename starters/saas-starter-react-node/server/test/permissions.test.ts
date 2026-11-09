import { describe, expect, it } from "vitest";
import { can } from "../../shared/permissions.ts";

describe("workspace roles", () => {
  it("lets only the owner manage billing and delete the workspace", () => {
    expect(can("owner", { billing: ["manage"] })).toBe(true);
    expect(can("owner", { organization: ["delete"] })).toBe(true);
    expect(can("admin", { billing: ["manage"] })).toBe(false);
    expect(can("admin", { organization: ["delete"] })).toBe(false);
    expect(can("member", { billing: ["manage"] })).toBe(false);
  });

  it("lets owners and admins manage members, invitations, settings and API keys", () => {
    for (const role of ["owner", "admin"]) {
      expect(can(role, { member: ["update", "delete"] })).toBe(true);
      expect(can(role, { invitation: ["create", "cancel"] })).toBe(true);
      expect(can(role, { organization: ["update"] })).toBe(true);
      expect(can(role, { apiKey: ["create", "delete"] })).toBe(true);
    }
  });

  it("lets everyone create and edit projects, and only owners and admins delete them", () => {
    for (const role of ["owner", "admin", "member"]) expect(can(role, { project: ["create", "read", "update"] })).toBe(true);
    expect(can("owner", { project: ["delete"] })).toBe(true);
    expect(can("admin", { project: ["delete"] })).toBe(true);
    expect(can("member", { project: ["delete"] })).toBe(false);
  });

  it("lets members use the app but nothing administrative", () => {
    expect(can("member", { member: ["delete"] })).toBe(false);
    expect(can("member", { invitation: ["create"] })).toBe(false);
    expect(can("member", { organization: ["update"] })).toBe(false);
    expect(can("member", { apiKey: ["create"] })).toBe(false);
  });

  it("denies unknown roles and missing roles", () => {
    expect(can("guest", { project: ["read"] })).toBe(false);
    expect(can(null, { project: ["read"] })).toBe(false);
  });
});
