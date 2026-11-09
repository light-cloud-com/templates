# Hono PostgreSQL CRUD API Starter

[![Licence: MIT](https://img.shields.io/badge/licence-MIT-blue)](LICENSE) [![Hono 4](https://img.shields.io/badge/Hono-4-E36002?logo=hono&logoColor=white)](https://hono.dev) [![Node.js 22](https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org) [![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org) [![Tests: node:test](https://img.shields.io/badge/tests-node%3Atest-5FA04E?logo=nodedotjs&logoColor=white)](test) [![Use this template](https://img.shields.io/badge/use%20this-template-2ea44f?logo=github)](https://github.com/light-cloud-templates/hono-postgresql-crud-api/generate) [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/hono-postgresql-crud-api)

A Hono 4 CRUD API starter for Node.js 22 that stores one resource, `items`, in PostgreSQL through postgres.js. It is a small, tested REST API boilerplate in plain JavaScript (ES modules, no build step) for developers who want a working create, read, update and delete service with validation, JSON errors and a health check, running on `@hono/node-server` and ready to rename and extend. It runs with `npm start` anywhere Node.js runs, and deploys to Light Cloud with a database in one click.

## Features

- REST endpoints for `items`: list with `limit` and `offset`, get, create, replace and delete
- PostgreSQL through postgres.js tagged-template queries, with up to 5 connections and a 5 second connect timeout
- The `items` table is created on start (`CREATE TABLE IF NOT EXISTS`), so there is no migration step
- Request validation without a library: `name` is trimmed and must be 1 to 200 characters, `description` must be a string or absent
- Every error is JSON `{ "error": "..." }`: `400` for invalid input or a malformed body, `404` for an unknown item or route
- `GET /health` answers `200` when the database answers and `503` when it does not
- Graceful shutdown on `SIGTERM`: in-flight requests finish, then the database client closes
- Tests with the built-in Node.js test runner and Hono's `app.request()`: unit and HTTP tests need no database, the full CRUD flow runs against a real PostgreSQL
- Three runtime dependencies: `hono`, `@hono/node-server` and `postgres`

## Quick start

You need Node.js 22 or newer and Docker (for a local PostgreSQL).

```bash
git clone https://github.com/light-cloud-templates/hono-postgresql-crud-api.git
cd hono-postgresql-crud-api
docker run -d --name items-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
npm install
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
npm run dev
```

Open <http://localhost:8080/items> to see the (empty) list. `npm run dev` restarts the server when a file changes; `npm start` runs it without watching.

Other ways to start:

- **Use this template**: press [Use this template](https://github.com/light-cloud-templates/hono-postgresql-crud-api/generate) to create your own repository from this one.
- **Deploy to Light Cloud**: open the [template page](https://www.light-cloud.com/templates/hono-postgresql-crud-api) and press Deploy to get a running copy with a database.

## Deploy

### Deploy to Light Cloud

[![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/hono-postgresql-crud-api)

The Deploy button copies this template into your GitHub account and creates:

- a server app that runs `npm start` on the port in `PORT`
- a PostgreSQL database, with `DATABASE_URL` set on the app

There are no secrets to fill in. Every push to the default branch deploys again. Templates with a database need a paid Light Cloud plan.

### Deploy anywhere else

This is a standard Hono app on Node.js with no Light Cloud code in it. Any host that runs Node.js 22 and can reach a PostgreSQL database runs it: run `npm install --omit=dev`, set `DATABASE_URL` and `PORT`, and start it with `npm start`.

## Project structure

```text
.
├── src/
│   ├── server.js             # creates the table, starts @hono/node-server, shuts down on SIGTERM
│   ├── app.js                # createApp(sql): mounts routes, JSON 404 and error handler
│   ├── config.js             # settings read from the environment
│   ├── db.js                 # postgres.js client and CREATE TABLE
│   ├── routes/
│   │   ├── index.js          # GET / and GET /health
│   │   └── items.js          # /items CRUD
│   └── lib/
│       └── validation.js     # request body and query checks
├── test/
│   ├── validation.test.js         # unit tests
│   ├── app.test.js                # HTTP tests with a fake client, no database needed
│   └── items.integration.test.js  # full CRUD flow, runs when DATABASE_URL is set
├── .env.example              # the variables, for local runs
└── package.json              # scripts: start, dev, test
```

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Lists the routes |
| `GET` | `/health` | `200` when the database answers, `503` when it does not |
| `GET` | `/items?limit=20&offset=0` | Lists items, oldest first (`limit` 1 to 100, default 20) |
| `GET` | `/items/:id` | Gets one item |
| `POST` | `/items` | Creates an item, answers `201` |
| `PUT` | `/items/:id` | Replaces an item's `name` and `description` |
| `DELETE` | `/items/:id` | Deletes an item, answers `204` |

An item is `{ "id", "name", "description", "created_at", "updated_at" }`. `name` is required; `description` is optional, and a `PUT` without it clears it. An `id` that is not a whole number, or is beyond the 32-bit `SERIAL` range, is a `404`.

```bash
curl -X POST http://localhost:8080/items \
  -H 'content-type: application/json' \
  -d '{"name": "First item", "description": "Hello"}'
```

On Light Cloud, use your app's URL instead of `http://localhost:8080`.

## Environment variables

| Name | Required | Default | What it does |
| --- | --- | --- | --- |
| `PORT` | No | `8080` | Port to listen on. Set by Light Cloud. |
| `DATABASE_URL` | Yes | `postgres://localhost:5432/postgres` | PostgreSQL connection URL. On Light Cloud it carries `sslmode=require` (TLS on, certificate not verified); leave `sslmode` out for a local database without TLS. Set by Light Cloud. |

The app does not load `.env` by itself: `.env.example` lists the values, and you export them in your shell as in the quick start.

## Testing

```bash
npm test
```

`npm test` runs `node --test`. The unit and HTTP tests use a fake postgres.js client and need no database. The integration test runs the whole CRUD flow against the database in `DATABASE_URL` and is skipped when it is not set. There is no linter configured.

## How it works

```mermaid
flowchart LR
    client["Client (browser, curl, app)"] -->|HTTPS JSON| node["@hono/node-server<br/>npm start"]
    node --> app["Hono app"]
    app --> validate["validation.js"]
    validate --> sql["postgres.js client<br/>max 5 connections"]
    sql -->|SQL over TLS| db[("PostgreSQL<br/>items table")]
    app -->|"GET /health: SELECT 1"| sql
```

On start, `server.js` creates the `items` table and only then listens. If the database is unreachable the process exits, so a broken connection shows up at deploy time, not on the first request. `src/db.js` drops the libpq-only parameters Light Cloud adds to `DATABASE_URL`, which postgres.js would otherwise send to the server.

## FAQ

### How do I connect to PostgreSQL locally?

Run PostgreSQL in Docker as in the quick start and export `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres` before `npm run dev`. Leave `sslmode` out of the URL, since the local container has no TLS.

### How do I add a new resource?

Add a routes file in `src/routes/` modelled on `items.js`, a check in `src/lib/validation.js` and its `CREATE TABLE` in `src/db.js`, then mount it in `src/app.js` with `app.route("/things", thingsRoutes(sql))`.

### How do I add a column to items?

Add it to the `CREATE TABLE` statement in `src/db.js`, to `parseItem` in `src/lib/validation.js` and to the queries in `src/routes/items.js`. `CREATE TABLE IF NOT EXISTS` does not change an existing table, so on a database that already has `items`, run an `ALTER TABLE` once.

### Can I deploy it without Light Cloud?

Yes. It is a plain Hono app on Node.js: any host with Node.js 22 and a PostgreSQL database runs it with `npm start`, given `DATABASE_URL` and `PORT`.

### Can I run this Hono API on Cloudflare Workers or Bun?

The routes in `src/app.js` use only Hono, so they port as they are. `src/server.js` uses `@hono/node-server` and postgres.js opens TCP connections, so on another runtime you replace the server entry point and check that the runtime supports postgres.js or swap in a driver that it does.

## Related templates

- [express-postgresql-crud-api](https://github.com/light-cloud-templates/express-postgresql-crud-api): the same items API in Express
- [nestjs-postgresql-crud-api](https://github.com/light-cloud-templates/nestjs-postgresql-crud-api): the same items API in NestJS and TypeScript
- [hono-api-starter](https://github.com/light-cloud-templates/hono-api-starter): Hono without a database
- [fastapi-postgresql-crud-api](https://github.com/light-cloud-templates/fastapi-postgresql-crud-api): the same items API in Python and FastAPI

## Licence

MIT, see [LICENSE](LICENSE).

---

Maintained by [Light Cloud](https://light-cloud.com): deploy apps, APIs and databases in one click.
