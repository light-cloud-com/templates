// Every setting comes from the environment. A feature switches on only when all of its variables are set,
// so a fresh deploy with just DATABASE_URL and AUTH_SECRET works end to end.
const env = (name: string) => process.env[name]?.trim() || undefined;

const stripeSecretKey = env("STRIPE_SECRET_KEY");
const stripeWebhookSecret = env("STRIPE_WEBHOOK_SECRET");
const stripePricePro = env("STRIPE_PRICE_PRO");
const stripePriceBusiness = env("STRIPE_PRICE_BUSINESS");

export const config = {
  appName: env("APP_NAME") ?? "Acme",
  appUrl: env("APP_URL")?.replace(/\/+$/, ""),
  adminEmails: (env("ADMIN_EMAILS") ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  email: {
    resendApiKey: env("RESEND_API_KEY"),
    from: env("EMAIL_FROM") ?? "Acme <onboarding@resend.dev>",
  },
  github: oauth("GITHUB"),
  google: oauth("GOOGLE"),
  stripe:
    stripeSecretKey && stripeWebhookSecret && stripePricePro && stripePriceBusiness
      ? {
          secretKey: stripeSecretKey,
          webhookSecret: stripeWebhookSecret,
          prices: { pro: stripePricePro, business: stripePriceBusiness },
        }
      : undefined,
};

function oauth(prefix: string) {
  const clientId = env(`${prefix}_CLIENT_ID`);
  const clientSecret = env(`${prefix}_CLIENT_SECRET`);
  return clientId && clientSecret ? { clientId, clientSecret } : undefined;
}

export const emailEnabled = Boolean(config.email.resendApiKey);
export const billingEnabled = Boolean(config.stripe);

/** Social sign-in buttons to show: only the providers whose client id and secret are both set. */
export const socialProviders = (["github", "google"] as const).filter((p) => config[p]);
