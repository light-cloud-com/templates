// What each workspace role may do in the app. Better Auth's organization plugin enforces the same
// split on its own endpoints (members, invitations, workspace update/delete), so the two agree.
export type Role = "owner" | "admin" | "member";

export type Action =
  | "project:read"
  | "project:write"
  | "workspace:update"
  | "workspace:delete"
  | "member:manage"
  | "apiKey:manage"
  | "billing:manage";

const grants: Record<Role, readonly Action[]> = {
  owner: ["project:read", "project:write", "workspace:update", "workspace:delete", "member:manage", "apiKey:manage", "billing:manage"],
  admin: ["project:read", "project:write", "workspace:update", "member:manage", "apiKey:manage"],
  member: ["project:read", "project:write"],
};

/** Better Auth stores roles as a comma-separated string; any granting role is enough. */
export function can(role: string | null | undefined, action: Action): boolean {
  if (!role) return false;
  return role.split(",").some((r) => grants[r.trim() as Role]?.includes(action) ?? false);
}

export class ForbiddenError extends Error {
  constructor(action: Action) {
    super(`Your role does not allow ${action}.`);
  }
}

export function assertCan(role: string | null | undefined, action: Action) {
  if (!can(role, action)) throw new ForbiddenError(action);
}
