import { z } from "zod";

const projectName = z.string().trim().min(1, "Name is required").max(100, "Keep the name under 100 characters");
const projectDescription = z.string().trim().max(500, "Keep the description under 500 characters");

export const projectInput = z.object({ name: projectName, description: projectDescription.default("") });
export const projectPatch = z.object({ name: projectName, description: projectDescription }).partial();
export type ProjectInput = z.input<typeof projectInput>;
export type ProjectPatch = z.input<typeof projectPatch>;

export const workspaceInput = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(60),
});

export const inviteInput = z.object({
  email: z.email("Enter a valid email"),
  role: z.enum(["admin", "member"]),
});

export const apiKeyInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
});

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
