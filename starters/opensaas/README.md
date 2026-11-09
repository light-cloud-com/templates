# Open SaaS

[![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://console.light-cloud.com/new?repo=https://github.com/light-cloud-com/starter-opensaas)

Your SaaS app, built on [Wasp](https://wasp.sh) from the
[Open SaaS](https://opensaas.sh) template: React + Node.js + Prisma, with
auth, payments, an admin dashboard, file uploads and background jobs wired
in. The [Open SaaS docs](https://docs.opensaas.sh) apply to this repository
as they stand — only the deployment parts are already taken care of.

```text
main.wasp.ts        # the app definition — routes, auth, jobs, email
schema.prisma       # your database models
src/                # client pages and server code, by feature
```

## How it deploys

The platform builds the whole app into one container: the Wasp server, and
the client served next to it from the same domain. The database schema is
applied automatically on each deploy (`prisma migrate deploy` when a
`migrations/` directory exists, `prisma db push` otherwise — so committing
migrations, once you start making them with `wasp db migrate-dev`, is all it
takes to switch to real migrations). Every push to the default branch
deploys automatically.

## Database

The app reads its PostgreSQL connection from `DATABASE_URL` — set
automatically when the database was created with the app, editable in the
environment's settings.

These are also set for you and follow the app's URL:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | the PostgreSQL connection string |
| `JWT_SECRET` | generated once at create — used for auth tokens |
| `WASP_SERVER_URL` | the app's public URL |
| `WASP_WEB_CLIENT_URL` | the app's public URL |

Adding a custom domain later? Update `WASP_SERVER_URL` and
`WASP_WEB_CLIENT_URL` to the new domain and redeploy.

## Make it yours

The app starts with **placeholder values** for the services it integrates —
it boots and serves, but each feature turns on when you set its real keys in
the environment settings:

| Feature | Variables | Where |
|---------|-----------|-------|
| **Email — signup needs this** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` | any SMTP provider (Resend, SendGrid, Mailgun, …); also change `defaultFrom` in `src/server/emailSender.wasp.ts` |
| Payments (Stripe) | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENTS_*_PLAN_ID` | [Stripe dashboard](https://dashboard.stripe.com); webhook endpoint is `<your-url>/payments-webhook` |
| Admin dashboard | `ADMIN_EMAILS` | comma-separated emails to grant admin on signup |
| AI demo app | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| File uploads | `AWS_S3_REGION`, `AWS_S3_IAM_ACCESS_KEY`, `AWS_S3_IAM_SECRET_KEY`, `AWS_S3_FILES_BUCKET` | any S3-compatible bucket |
| Analytics | `PLAUSIBLE_*` or `GOOGLE_ANALYTICS_*` | optional — the admin dashboard charts read from these |

Email verification is required before login, so **SMTP is the first thing to
configure** on a fresh deployment. The other providers (Lemon Squeezy,
Polar) have placeholder variables too; if you switch to one of them, follow
the [Open SaaS payments guide](https://docs.opensaas.sh/guides/payments-integration/).

## Good to know

- Develop locally the normal Wasp way: `wasp install`, `wasp start db`,
  `wasp db migrate-dev`, `wasp start` — see the
  [Open SaaS getting started guide](https://docs.opensaas.sh/start/getting-started/).
- The hourly stats job (pg-boss) runs inside the same container and keeps the
  admin dashboard's numbers fresh.
- Uploaded files belong in S3 — the container filesystem does not survive a
  restart.
