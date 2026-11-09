// What each workspace role may do in the app. Better Auth's organization plugin enforces the same
// split on its own endpoints (members, invitations, workspace update/delete), so the two agree.
export type Role = "owner" | "admin" | "member";

export type Action =
  | "project:read"
  | "project:write"
  | "project:delete"
  | "workspace:update"
  | "workspace:delete"
  | "member:manage"
  | "apiKey:manage"
  | "billing:manage";

const grants: Record<Role, readonly Action[]> = {
  owner: ["project:read", "project:write", "project:delete", "workspace:update", "workspace:delete", "member:manage", "apiKey:manage", "billing:manage"],
  admin: ["project:read", "project:write", "project:delete", "workspace:update", "member:manage", "apiKey:manage"],
  member: ["project:read", "project:write"],
};

/** Better Auth stores roles as a comma-separated string; any granting role is enough. */
export function can(role: string | null | undefined, action: Action): boolean {
  if (!role) return false;
  return role.split(",").some((r) => grants[r.trim() as Role]?.includes(action) ?? false);
}

const refusals: Record<Action, string> = {
  "project:read": "You are not a member of this workspace.",
  "project:write": "You are not a member of this workspace.",
  "project:delete": "Only owners and admins can delete projects.",
  "workspace:update": "Only owners and admins can change workspace settings.",
  "workspace:delete": "Only owners can delete the workspace.",
  "member:manage": "Only owners and admins can manage members.",
  "apiKey:manage": "Only owners and admins can manage API keys.",
  "billing:manage": "Only owners can change the plan.",
};

export class ForbiddenError extends Error {
  constructor(public action: Action) {
    super(refusals[action]);
  }
}

export function assertCan(role: string | null | undefined, action: Action) {
  if (!can(role, action)) throw new ForbiddenError(action);
}
