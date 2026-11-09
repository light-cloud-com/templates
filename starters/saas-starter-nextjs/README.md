# SaaS Starter: Next.js + PostgreSQL

A complete SaaS starter built with Next.js 16 (App Router), PostgreSQL, Better Auth, Drizzle ORM, Tailwind CSS and shadcn/ui. It has sign-up, teams with roles, onboarding, Stripe subscriptions, an admin panel, API keys and a REST API. Deploy it with a database in one click: open the URL, sign up, and it works with no keys.

[![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/saas-starter-nextjs)

## Features

- **Accounts**: email and password sign-up and sign-in, sign-out, password reset by email, and email verification (only when an email provider is set). GitHub and Google sign-in appear when you add their keys. Sessions live in the database.
- **Teams**: workspaces with owner, admin and member roles. Switch between workspaces, invite people by email (the invite link also shows in the app), accept or decline invites.
- **Onboarding**: after the first sign-up, name your workspace, invite teammates (optional) and pick a plan (when billing is on), then land on a dashboard with a getting-started checklist.
- **Marketing pages**: landing page with features and FAQ, a pricing page driven by one plans file, terms and privacy placeholders. Light and dark theme, works at phone width, keyboard and screen reader friendly.
- **App**: sidebar shell with workspace switcher and user menu, a Projects example resource (create, edit, delete) with plan limits (Free = 3 projects), account settings and workspace settings.
- **Billing**: Stripe Checkout to upgrade, the Stripe customer portal to manage, and a webhook that keeps the plan in sync. Off until you add the Stripe variables; until then everyone is on Free.
- **Admin panel** at `/admin`: search users and workspaces, see plans, disable or re-enable users, sign in as a user.
- **Emails**: verification, password reset, invitation and welcome emails through Resend, or written to the server log when no key is set.
- **API keys and REST API**: per-workspace keys, shown once and stored as a hash, for `GET/POST /api/v1/projects` and friends.
- **Health check**: `GET /api/health` answers `200` when the database answers and `503` when it does not.

## How it works

```mermaid
flowchart LR
    browser["Browser"] -->|HTTPS| app["Next.js server<br/>pages, server actions"]
    client["Scripts and integrations"] -->|"Bearer API key"| api["/api/v1/projects"]
    app --> auth["Better Auth<br/>/api/auth/*"]
    api --> db
    app --> db[("PostgreSQL<br/>users, sessions, workspaces,<br/>projects, API keys")]
    auth --> db
    auth -.->|"when keys are set"| stripe["Stripe<br/>Checkout, portal, webhook"]
    auth -.->|"when RESEND_API_KEY is set"| resend["Resend<br/>email"]
    auth -.->|"when client ids are set"| oauth["GitHub / Google"]
```

`npm start` applies the SQL migrations in `drizzle/` first (safe to run on every start, and only one instance migrates at a time), then starts `next start` on `PORT`. On Light Cloud the database and `DATABASE_URL` are created for you and the app runs as a server container. The app works out its own public URL from each request (Cloud Run passes it in `x-forwarded-host`), so auth callbacks and email links work before you know the URL.

## Project structure

```text
.
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Landing (/), /pricing, /terms, /privacy
│   │   ├── (auth)/               # /sign-in, /sign-up, /forgot-password, /reset-password, /invite/[id]
│   │   ├── (app)/                # Signed-in app: /dashboard, /projects, /settings/*, /workspaces/new
│   │   ├── onboarding/           # First-time setup
│   │   ├── admin/                # /admin, platform admins only
│   │   └── api/
│   │       ├── auth/[...all]/    # Better Auth: sign-in, OAuth callbacks, Stripe webhook
│   │       ├── health/           # GET /api/health
│   │       └── v1/projects/      # REST API, API key auth
│   ├── components/               # App shell, forms, plan cards; ui/ holds shadcn/ui components
│   └── lib/
│       ├── auth.ts               # Better Auth setup: accounts, workspaces, admin, Stripe
│       ├── config.ts             # Environment variables, and which features are on
│       ├── plans.ts              # Free, Pro, Business: prices and limits
│       ├── permissions.ts        # What owner, admin and member may do
│       ├── billing.ts            # Current plan of a workspace
│       ├── email.ts              # Resend or the server log, plus email texts
│       ├── api-keys.ts           # Key generation and hashing
│       ├── projects.ts           # Project queries shared by the app and the API
│       ├── session.ts            # Signed-in user and active workspace helpers
│       └── db/                   # Drizzle client and schema
├── drizzle/                      # SQL migrations (committed)
├── scripts/
│   ├── migrate.mjs               # Applies migrations, run by npm start
│   └── smoke.mjs                 # Smoke test against a running app
├── test/                         # Vitest unit and integration tests
├── .env.example                  # Every environment variable, explained
├── drizzle.config.ts
└── next.config.ts
```

## Environment variables

| Variable | Needed | Set by | What it does |
| --- | --- | --- | --- |
| `DATABASE_URL` | Required | Light Cloud | PostgreSQL connection URL. On Light Cloud it uses TLS (`sslmode=require`, certificate not verified). |
| `AUTH_SECRET` | Required | Light Cloud (generated) | Signs sessions and email tokens. Any long random string, e.g. `openssl rand -hex 32`. |
| `PORT` | | Light Cloud | Port to listen on (default `3000`). |
| `APP_URL` | Optional | You | Public URL, e.g. `https://app.example.com`. Without it the URL comes from each request. Set it when you add a custom domain. |
| `APP_NAME` | Optional | You | Product name in the header, titles and emails (default `Acme`). |
| `ADMIN_EMAILS` | Optional | You | Comma-separated emails that are admins, on top of the first user. |
| `RESEND_API_KEY` | Turns on email | You | Sends email through Resend and turns on email verification. |
| `EMAIL_FROM` | With email | You | Sender, e.g. `Acme <hello@example.com>` on a domain verified in Resend. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Turns on GitHub sign-in | You | From a GitHub OAuth app. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Turns on Google sign-in | You | From a Google Cloud OAuth client. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` | Turns on billing (all four) | You | Stripe API key, webhook signing secret and the monthly price ids for Pro and Business. |

None of these reach the browser. Change a variable on Light Cloud, then redeploy.

## Run locally

You need Node.js 22.12 or newer and Docker (for the database).

```bash
docker run -d --name saas-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
cp .env.example .env.local     # then set AUTH_SECRET to a long random string
npm install
npm run dev                    # applies migrations, then http://localhost:3000
```

Sign up: the first account is the admin. Emails (verification, reset, invites) are printed in the terminal until you set `RESEND_API_KEY`.

After changing `src/lib/db/schema.ts`, run `npm run db:generate` and commit the new file in `drizzle/`.

## Testing

```bash
npm run lint
npm run typecheck
npm test                       # unit tests; plus the integration test when DATABASE_URL is set
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres npm test
npm run build && npm start     # then, in another terminal:
npm run smoke                  # BASE_URL=http://localhost:3000 by default
```

The integration test signs up two users, creates their workspaces and API keys, and drives the REST API: create, read, update, delete, workspace isolation, plan limit and bad keys.

## Turn on email

1. Create a [Resend](https://resend.com) account and verify your domain.
2. Set `RESEND_API_KEY` and `EMAIL_FROM` (an address on that domain), then redeploy.

From then on new users confirm their email before they can sign in. Without a verified domain, Resend's test sender `onboarding@resend.dev` only delivers to your own address.

## Turn on Stripe billing

1. In Stripe, create two products with a monthly price each, Pro and Business, and copy the price ids (`price_...`) into `STRIPE_PRICE_PRO` and `STRIPE_PRICE_BUSINESS`.
2. Set `STRIPE_SECRET_KEY`.
3. Add a webhook endpoint `https://<your app>/api/auth/stripe/webhook` for the events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`, and set its signing secret as `STRIPE_WEBHOOK_SECRET`.
4. Turn on the customer portal in Stripe's billing settings, then redeploy.

Subscriptions belong to the workspace; only owners can upgrade or open the portal. Plan names, prices shown and limits are in `src/lib/plans.ts`.

## Turn on GitHub or Google sign-in

- **GitHub**: create an OAuth app under Settings → Developer settings, with the callback URL `https://<your app>/api/auth/callback/github`.
- **Google**: create an OAuth client (web application) in Google Cloud, with the redirect URI `https://<your app>/api/auth/callback/google`.

Set the client id and secret, redeploy, and the button appears on the sign-in and sign-up pages.

## How admin works

The first account ever created is an admin, and so is anyone whose email is in `ADMIN_EMAILS`. Admins see **Admin** in the user menu and can open `/admin`; everyone else gets a 404 there. From the panel an admin can search users and workspaces, see each workspace's plan, disable or re-enable a user (disabling signs them out everywhere) and sign in as a user to see what they see.

## API

Create a key under **Settings → API keys** (owners and admins). The key is shown once; only its hash is stored. Every request acts on the key's workspace.

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/api/v1/projects` | Lists the workspace's projects, newest first |
| `POST` | `/api/v1/projects` | Creates a project from `{"name", "description"}`, answers `201` |
| `GET` | `/api/v1/projects/:id` | Gets one project |
| `PATCH` | `/api/v1/projects/:id` | Changes `name` and/or `description` |
| `DELETE` | `/api/v1/projects/:id` | Deletes a project, answers `204` |

Errors are JSON `{ "error": "..." }`: `400` invalid input, `401` missing or wrong key, `402` plan limit reached, `404` not found.

```bash
export API_KEY=sk_live_...
curl -X POST https://<your app>/api/v1/projects \
  -H "Authorization: Bearer $API_KEY" \
  -H "content-type: application/json" \
  -d '{"name": "Website", "description": "Marketing site"}'
curl https://<your app>/api/v1/projects -H "Authorization: Bearer $API_KEY"
```

## Make it yours

Projects is the example resource: rename it in `src/lib/db/schema.ts` and `src/lib/projects.ts`, generate a migration, and the pages in `src/app/(app)/projects` and the API in `src/app/api/v1` follow the same pattern. Colours are tokens at the top of `src/app/globals.css`. Push, and Light Cloud redeploys.

## License

MIT, see [LICENSE](./LICENSE).
