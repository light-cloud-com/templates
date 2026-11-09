// Workspace roles. Shared by the server (enforcement) and the client (hiding
// buttons), and handed to Better Auth's organization and API key plugins.
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc, memberAc, ownerAc } from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  project: ["create", "read", "update", "delete"],
  apiKey: ["create", "read", "update", "delete"],
  billing: ["manage"],
} as const;

export const ac = createAccessControl(statement);

const allProjects = ["create", "read", "update", "delete"] as const;
const allKeys = ["create", "read", "update", "delete"] as const;

export const roles = {
  owner: ac.newRole({ ...ownerAc.statements, project: allProjects, apiKey: allKeys, billing: ["manage"] }),
  admin: ac.newRole({ ...adminAc.statements, project: allProjects, apiKey: allKeys }),
  member: ac.newRole({ ...memberAc.statements, project: allProjects }),
};

export type Role = keyof typeof roles;
export const ROLES: Role[] = ["owner", "admin", "member"];

type Statement = typeof statement;
export type Permission = {
  [K in keyof Statement]?: Statement[K][number][];
};

export function can(role: string | null | undefined, permission: Permission): boolean {
  const r = roles[role as Role];
  if (!r) return false;
  return r.authorize(permission as Parameters<typeof r.authorize>[0]).success;
}
