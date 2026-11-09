import { z } from "zod";

// Limits shared by the forms (maxLength) and the server (validation).
export const LIMITS = { userName: 100, workspaceName: 60, apiKeyName: 60, projectName: 100, projectDescription: 500 } as const;

const text = (label: string, max: number, min = 1) =>
  z.string().trim()
    .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`);

const projectName = text("Name", LIMITS.projectName);
const projectDescription = z.string().trim().max(LIMITS.projectDescription, `Description must be ${LIMITS.projectDescription} characters or fewer`);

export const projectInput = z.object({ name: projectName, description: projectDescription.default("") });
export const projectPatch = z.object({ name: projectName, description: projectDescription }).partial();
export type ProjectInput = z.input<typeof projectInput>;
export type ProjectPatch = z.input<typeof projectPatch>;

export const userName = text("Name", LIMITS.userName);
export const workspaceName = text("Workspace name", LIMITS.workspaceName, 2);
export const apiKeyName = text("Key name", LIMITS.apiKeyName);

export const workspaceInput = z.object({ name: workspaceName });

export const inviteInput = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(["admin", "member"]),
});

export const apiKeyInput = z.object({ name: apiKeyName });

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** What the browser needs to know about this deployment. Never secrets. */
export interface AppConfig {
  appName: string;
  emailEnabled: boolean;
  billingEnabled: boolean;
  providers: { github: boolean; google: boolean };
}

export interface WorkspaceSummary {
  plan: "free" | "pro" | "business";
  role: string;
  subscriptionStatus: string | null;
  counts: { projects: number; members: number; invitations: number; apiKeys: number };
}
