import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { and, count, eq, gt, ne, sql } from "drizzle-orm";
import type { ZodType } from "zod";
import { config } from "../config.ts";
import { db } from "../db/index.ts";
import * as schema from "../db/schema.ts";
import { ac, roles } from "../../../shared/permissions.ts";
import { apiKeyName, LIMITS, userName, workspaceName } from "../../../shared/schemas.ts";
import { emails } from "./email.ts";
import { baseUrlFrom } from "./url.ts";
import { getWorkspacePlan, stripePlugin } from "./billing.ts";

// API keys reference a workspace by id only, so they are removed by hand.
async function deleteWorkspaceData(id: string) {
  await db.delete(schema.apikey).where(eq(schema.apikey.referenceId, id));
  await db.delete(schema.organization).where(eq(schema.organization.id, id));
}

// Names typed into Better Auth's own endpoints, checked with the same rules as the forms.
const nameRules: Record<string, [(body: Record<string, unknown>) => unknown, ZodType]> = {
  "/sign-up/email": [(b) => b.name, userName],
  "/update-user": [(b) => b.name, userName],
  "/organization/create": [(b) => b.name, workspaceName],
  "/organization/update": [(b) => (b.data as Record<string, unknown> | undefined)?.name, workspaceName],
  "/api-key/create": [(b) => b.name, apiKeyName],
};

const validateInput = createAuthMiddleware(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>;
  const rule = nameRules[ctx.path];
  if (rule) {
    const value = rule[0](body);
    if (value !== undefined) {
      const parsed = rule[1].safeParse(value);
      if (!parsed.success) throw new APIError("BAD_REQUEST", { message: parsed.error.issues[0]?.message ?? "Invalid name" });
    }
  }
  // Better Auth answers "ok" for an address that is taken (so it cannot be probed);
  // a signed-in user changing their own email gets the real reason instead.
  if (ctx.path === "/change-email" && typeof body.newEmail === "string" && (await getSessionFromCtx(ctx))) {
    const [taken] = await db.select({ id: schema.user.id }).from(schema.user)
      .where(eq(sql`lower(${schema.user.email})`, body.newEmail.toLowerCase()));
    if (taken) throw new APIError("BAD_REQUEST", { message: "That email is already used by another account" });
  }
});

/** Members plus pending invitations may not exceed the plan's member limit. */
async function assertSeatFree(organizationId: string) {
  const plan = await getWorkspacePlan(organizationId);
  const limit = plan.limits.members;
  if (limit === null) return;
  const [[members], [pending]] = await Promise.all([
    db.select({ n: count() }).from(schema.member).where(eq(schema.member.organizationId, organizationId)),
    db.select({ n: count() }).from(schema.invitation).where(and(
      eq(schema.invitation.organizationId, organizationId),
      eq(schema.invitation.status, "pending"),
      gt(schema.invitation.expiresAt, new Date()),
    )),
  ]);
  if (members!.n + pending!.n >= limit) {
    throw new APIError("FORBIDDEN", {
      message: `The ${plan.name} plan allows ${limit} members, counting pending invitations. Cancel an invitation or upgrade to invite more.`,
    });
  }
}

export const auth = betterAuth({
  appName: config.appName,
  secret: config.authSecret,
  // Unset baseURL + trusted proxy headers: the URL comes from each request,
  // so the app works on whatever domain it is deployed to.
  baseURL: config.appUrl,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  advanced: { trustedProxyHeaders: true },
  rateLimit: { storage: "database" },
  hooks: { before: validateInput },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Verification is only required when emails can actually be delivered.
    requireEmailVerification: !!config.email,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => emails.reset(user.email, url),
  },
  emailVerification: {
    sendOnSignUp: !!config.email,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => emails.verify(user.email, url),
    afterEmailVerification: async (user) => emails.welcome(user.email, user.name),
  },
  socialProviders: {
    ...(config.github ? { github: config.github } : {}),
    ...(config.google ? { google: config.google } : {}),
  },
  user: {
    additionalFields: {
      onboarded: { type: "boolean", defaultValue: false, input: false },
    },
    changeEmail: { enabled: true, updateEmailWithoutVerification: true },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        // Workspaces the user owns go with them, unless other people still use them.
        const owned = await db.select({ id: schema.member.organizationId }).from(schema.member)
          .where(and(eq(schema.member.userId, user.id), eq(schema.member.role, "owner")));
        for (const { id } of owned) {
          const [others] = await db.select({ n: count() }).from(schema.member)
            .where(and(eq(schema.member.organizationId, id), ne(schema.member.userId, user.id)));
          if (others!.n > 0) {
            throw new APIError("BAD_REQUEST", { message: "You own a workspace with other members. Transfer ownership or delete it first." });
          }
        }
        for (const { id } of owned) await deleteWorkspaceData(id);
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Platform admin: the first account ever created, plus ADMIN_EMAILS.
        before: async (user) => {
          const [existing] = await db.select({ n: count() }).from(schema.user);
          const isAdmin = existing!.n === 0 || config.adminEmails.includes(user.email.toLowerCase());
          return { data: { ...user, role: isAdmin ? "admin" : "user" } };
        },
        after: async (user) => {
          if (!config.email) await emails.welcome(user.email, user.name);
        },
      },
    },
    session: {
      create: {
        // Someone added to ADMIN_EMAILS after signing up becomes admin on next sign-in.
        after: async (session) => {
          if (config.adminEmails.length === 0) return;
          const [u] = await db.select().from(schema.user).where(eq(schema.user.id, session.userId));
          if (u && u.role !== "admin" && config.adminEmails.includes(u.email.toLowerCase())) {
            await db.update(schema.user).set({ role: "admin" }).where(eq(schema.user.id, u.id));
          }
        },
      },
    },
  },
  plugins: [
    organization({
      ac,
      roles,
      invitationExpiresIn: 60 * 60 * 24 * 7,
      membershipLimit: async (_user, org) => (await getWorkspacePlan(org.id)).limits.members ?? Number.MAX_SAFE_INTEGER,
      organizationHooks: {
        // A repeat invite to the same address is a resend (the app sends resend: true) and skips this.
        beforeCreateInvitation: async ({ organization: org }) => {
          await assertSeatFree(org.id);
        },
        afterDeleteOrganization: async ({ organization: org }) => {
          await db.delete(schema.apikey).where(eq(schema.apikey.referenceId, org.id));
        },
      },
      sendInvitationEmail: async ({ id, email, organization: org, inviter }, request) => {
        await emails.invite(email, `${baseUrlFrom(request)}/invite/${id}`, org.name, inviter.user.name || inviter.user.email);
      },
    }),
    admin(),
    apiKey({
      references: "organization",
      defaultPrefix: "sk_",
      maximumNameLength: LIMITS.apiKeyName,
      rateLimit: { enabled: true, timeWindow: 60_000, maxRequests: 120 },
    }),
    ...(stripePlugin ? [stripePlugin] : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
