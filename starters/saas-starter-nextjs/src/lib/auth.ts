import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, organization } from "better-auth/plugins";
import { and, asc, count, eq, like } from "drizzle-orm";
import Stripe from "stripe";
import { activeSubscription, getWorkspacePlan } from "./billing";
import { config, emailEnabled } from "./config";
import { db, schema } from "./db";
import { emails, sendEmail } from "./email";
import { can } from "./permissions";
import { getPlan } from "./plans";
import { baseUrl, isSameOrigin } from "./url";

// Called through auth.api from a server action there is no Request, so read the headers Next.js holds.
async function requestOrigin(request?: Request) {
  if (request) return baseUrl(request.headers);
  try {
    const { headers } = await import("next/headers");
    return baseUrl(await headers());
  } catch {
    return config.appUrl ?? "";
  }
}

const REDIRECT_FIELDS = ["callbackURL", "redirectTo", "errorCallbackURL", "newUserCallbackURL", "successUrl", "cancelUrl", "returnUrl"];

/**
 * With no APP_URL the base URL is resolved per request (`allowedHosts: ["*"]`), which also makes Better
 * Auth trust every origin. This puts the CSRF and open-redirect checks back: browser requests must come
 * from the app's own origin, and every redirect target must be a relative path or on that origin.
 */
const sameOriginGuard = createAuthMiddleware(async (ctx) => {
  const base = ctx.context.baseURL;
  const request = ctx.request;
  if (request && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    // No Origin but a session cookie: a browser would have sent one, so refuse (Stripe's webhook has neither).
    if (origin ? !isSameOrigin(origin, base) : request.headers.has("cookie")) {
      throw new APIError("FORBIDDEN", { message: "Invalid origin" });
    }
  }
  for (const field of REDIRECT_FIELDS) {
    const value = ctx.body?.[field] ?? ctx.query?.[field];
    if (typeof value === "string" && value && !isSameOrigin(value, base)) {
      throw new APIError("FORBIDDEN", { message: `Invalid ${field}` });
    }
  }
});

const isAdminEmail = (email: string) => config.adminEmails.includes(email.toLowerCase());

const billingPlugins = config.stripe
  ? [
      stripe({
        stripeClient: new Stripe(config.stripe.secretKey),
        stripeWebhookSecret: config.stripe.webhookSecret,
        // Subscriptions belong to the workspace, not the person who paid.
        organization: { enabled: true },
        subscription: {
          enabled: true,
          plans: [
            { name: "pro", priceId: config.stripe.prices.pro },
            { name: "business", priceId: config.stripe.prices.business },
          ],
          authorizeReference: async ({ user, referenceId }) => {
            const [m] = await db
              .select({ role: schema.member.role })
              .from(schema.member)
              .where(and(eq(schema.member.organizationId, referenceId), eq(schema.member.userId, user.id)));
            return can(m?.role, "billing:manage");
          },
        },
      }),
    ]
  : [];

export const auth = betterAuth({
  appName: config.appName,
  // AUTH_SECRET signs sessions and tokens; Light Cloud generates one at deploy. `next build` loads this
  // module without runtime env, so it gets a throwaway value that never serves a request.
  secret: process.env.AUTH_SECRET || (process.env.NEXT_PHASE === "phase-production-build" ? "build-only-placeholder-secret-not-used-at-runtime" : undefined),
  // APP_URL when set; otherwise the host the request came in on (x-forwarded-host behind Cloud Run's proxy).
  baseURL: config.appUrl ?? { allowedHosts: ["*"], protocol: "auto" },
  database: drizzleAdapter(db, { provider: "pg", schema }),
  advanced: { trustedProxyHeaders: true },
  hooks: { before: sameOriginGuard },
  // Better Auth's in-memory limiter for HTTP calls to /api/auth/*, on in production: 100 requests / 10 s
  // per IP, 3 / 10 s for sign-in, sign-up and password changes, 3 / 60 s for reset and verification
  // emails. The app's own forms are server actions and use src/lib/rate-limit.ts instead.
  rateLimit: { storage: "memory" },
  emailAndPassword: {
    enabled: true,
    // Verification is only demanded when an email can actually be delivered.
    requireEmailVerification: emailEnabled,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => sendEmail({ to: user.email, ...emails.reset(url) }),
  },
  emailVerification: {
    sendOnSignUp: emailEnabled,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => sendEmail({ to: user.email, ...emails.verify(url) }),
  },
  socialProviders: {
    ...(config.github && { github: config.github }),
    ...(config.google && { google: config.google }),
  },
  user: {
    additionalFields: {
      onboardingCompleted: { type: "boolean", defaultValue: false, input: false },
    },
    changeEmail: { enabled: true, updateEmailWithoutVerification: true },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const owned = await db
          .select({ id: schema.organization.id, name: schema.organization.name })
          .from(schema.member)
          .innerJoin(schema.organization, eq(schema.organization.id, schema.member.organizationId))
          .where(and(eq(schema.member.userId, user.id), like(schema.member.role, "%owner%")));
        for (const org of owned) {
          const [{ members }] = await db
            .select({ members: count() })
            .from(schema.member)
            .where(eq(schema.member.organizationId, org.id));
          if (members > 1 || (await activeSubscription(org.id))) {
            throw new APIError("BAD_REQUEST", {
              message: `You own ${org.name}. Delete that workspace or hand it to another owner first.`,
            });
          }
        }
        // Workspaces where this user was alone go with them (projects and keys cascade).
        for (const org of owned) await db.delete(schema.organization).where(eq(schema.organization.id, org.id));
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // The first account ever created runs the platform; so does anyone listed in ADMIN_EMAILS.
        // Two sign-ups in the same instant could both become admin, which is harmless for a new install.
        before: async (user) => {
          const [{ users }] = await db.select({ users: count() }).from(schema.user);
          return { data: { ...user, role: users === 0 || isAdminEmail(user.email) ? "admin" : "user" } };
        },
        after: async (user) => {
          await sendEmail({ to: user.email, ...emails.welcome(user.name) }).catch((err) => console.error(err));
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const [u] = await db
            .select({ email: schema.user.email, role: schema.user.role })
            .from(schema.user)
            .where(eq(schema.user.id, session.userId));
          // ADMIN_EMAILS added after sign-up takes effect on the next sign-in.
          if (u && isAdminEmail(u.email) && u.role !== "admin") {
            await db.update(schema.user).set({ role: "admin" }).where(eq(schema.user.id, session.userId));
          }
          // Open the workspace the user joined first, so the dashboard has something to show.
          const [m] = await db
            .select({ organizationId: schema.member.organizationId })
            .from(schema.member)
            .where(eq(schema.member.userId, session.userId))
            .orderBy(asc(schema.member.createdAt))
            .limit(1);
          return { data: { ...session, activeOrganizationId: m?.organizationId ?? null } };
        },
      },
    },
  },
  plugins: [
    organization({
      // Plan limit on seats, checked by Better Auth when inviting and accepting.
      membershipLimit: async (_user, org) => getPlan(await getWorkspacePlan(org.id)).limits.members ?? Infinity,
      invitationExpiresIn: 7 * 24 * 60 * 60,
      sendInvitationEmail: async ({ id, email, organization, inviter }, request) => {
        const url = `${await requestOrigin(request)}/invite/${id}`;
        await sendEmail({ to: email, ...emails.invite(url, organization.name, inviter.user.name) });
      },
      organizationHooks: {
        beforeDeleteOrganization: async ({ organization }) => {
          if (await activeSubscription(organization.id)) {
            throw new APIError("BAD_REQUEST", { message: "Cancel the subscription in Billing before deleting the workspace." });
          }
        },
        // Someone who joins through an invitation already has a workspace: skip the first-time setup.
        afterAcceptInvitation: async ({ user }) => {
          await db.update(schema.user).set({ onboardingCompleted: true }).where(eq(schema.user.id, user.id));
        },
      },
    }),
    admin({ bannedUserMessage: "This account has been disabled. Contact support if you think this is a mistake." }),
    ...billingPlugins,
    nextCookies(), // must stay last: lets server actions set the session cookie
  ],
});

export type Session = typeof auth.$Infer.Session;
