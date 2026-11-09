// Every setting the server reads from the environment, in one place.
// Integrations switch on only when all of their variables are set.
const env = process.env;
const isProduction = env.NODE_ENV === "production";

function list(value: string | undefined): string[] {
  return (value ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function secret(): string {
  if (env.AUTH_SECRET) return env.AUTH_SECRET;
  if (isProduction) throw new Error("AUTH_SECRET is not set. Set it to a long random string (Light Cloud generates one).");
  return "dev-only-secret-change-me-dev-only-secret";
}

export const config = {
  isProduction,
  port: Number(env.PORT) || 8080,
  databaseUrl: env.DATABASE_URL ?? "",
  authSecret: secret(),
  appName: env.APP_NAME || "Acme",
  // Unset: the public URL comes from each request (x-forwarded-host / -proto).
  appUrl: env.APP_URL?.replace(/\/+$/, "") || undefined,
  adminEmails: list(env.ADMIN_EMAILS),
  email: env.RESEND_API_KEY
    ? { apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM || "Acme <onboarding@resend.dev>" }
    : null,
  github:
    env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET }
      : null,
  google:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
      : null,
  stripe:
    env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && env.STRIPE_PRICE_PRO && env.STRIPE_PRICE_BUSINESS
      ? {
          secretKey: env.STRIPE_SECRET_KEY,
          webhookSecret: env.STRIPE_WEBHOOK_SECRET,
          prices: { pro: env.STRIPE_PRICE_PRO, business: env.STRIPE_PRICE_BUSINESS },
        }
      : null,
};
