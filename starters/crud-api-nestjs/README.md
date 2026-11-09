# CRUD API: NestJS + PostgreSQL

A small REST API for one resource, `items`, built with NestJS and node-postgres. Deploy it with a PostgreSQL database in one click, then make it yours.

[![Deploy to Light Cloud](https://light-cloud.com/button.svg)](https://www.light-cloud.com/templates/crud-api-nestjs)

## How it works

```mermaid
flowchart LR
    client["Client (browser, curl, app)"] -->|HTTPS JSON| api["NestJS API"]
    api -->|SQL over TLS| db[("PostgreSQL<br/>items table")]
```

The app creates the `items` table when it starts, so there is no migration step. On Light Cloud the database connection is set for you; the app listens on `PORT`.

## Routes

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/` | Lists the routes |
| `GET` | `/health` | `200` when the database answers, `503` when it does not |
| `GET` | `/items?limit=20&offset=0` | Lists items, oldest first (`limit` 1 to 100, default 20) |
| `GET` | `/items/:id` | Gets one item |
| `POST` | `/items` | Creates an item, answers `201` |
| `PUT` | `/items/:id` | Replaces an item's `name` and `description` |
| `DELETE` | `/items/:id` | Deletes an item, answers `204` |
| `GET` | `/docs` | OpenAPI docs |

An item is `{ "id", "name", "description", "created_at", "updated_at" }`. `name` is required (1 to 200 characters); `description` is optional. Errors are JSON `{ "error": "..." }`: `400` for invalid input, `404` for an unknown item.

## Project structure

```text
.
├── src/
│   ├── main.ts                     # Bootstraps the app and listens on PORT
│   ├── app.setup.ts                # Validation, JSON errors, Swagger, shutdown hooks
│   ├── app.module.ts               # Root module
│   ├── app.controller.ts           # GET /
│   ├── config.ts                   # Settings read from the environment
│   ├── common/filters/
│   │   └── json-error.filter.ts    # Every error leaves as { "error": "..." }
│   ├── database/
│   │   ├── database.module.ts      # Global module exporting DatabaseService
│   │   └── database.service.ts     # pg pool, creates the items table on start
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts    # GET /health
│   └── items/
│       ├── items.module.ts
│       ├── items.controller.ts     # /items routes
│       ├── items.service.ts        # SQL for items
│       ├── item-id.pipe.ts         # Turns :id into a number or a 404
│       └── dto/                    # Request body and query validation
├── test/
│   ├── app.e2e.test.ts             # HTTP tests with a fake database, no database needed
│   └── items.integration.test.ts   # Full CRUD flow, runs when DATABASE_URL is set
├── .env.example                    # Environment variables the app reads
├── tsconfig.json                   # Build (src only, into dist/)
├── tsconfig.test.json              # Tests (src and test, into dist-test/)
└── package.json
```

## Run locally

You need Node.js 22 or newer and Docker (for the database).

```bash
docker run -d --name items-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
npm install
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
npm run build
npm start
```

The API is now on http://localhost:8080.

## Test

```bash
npm test
```

The tests use Nest's testing module and the built-in Node test runner. Without `DATABASE_URL` the integration test is skipped; with it set (as above) it runs the whole CRUD flow against the database.

## Try it

```bash
curl -X POST http://localhost:8080/items -H 'content-type: application/json' -d '{"name": "First item", "description": "Hello"}'
curl 'http://localhost:8080/items?limit=10'
curl http://localhost:8080/items/1
curl -X PUT http://localhost:8080/items/1 -H 'content-type: application/json' -d '{"name": "Renamed"}'
curl -X DELETE http://localhost:8080/items/1
```

On Light Cloud, use your app's URL instead of http://localhost:8080.

## Configuration

| Variable | Set by | Meaning |
| --- | --- | --- |
| `PORT` | Light Cloud | Port to listen on (default `8080`) |
| `DATABASE_URL` | Light Cloud | PostgreSQL connection URL. On Light Cloud it ends with `sslmode=require` (TLS on, certificate not verified). Leave `sslmode` out for a local database without TLS. |

## Make it yours

Each feature is a module under `src/` (controller, service, DTOs). Rename `items`, add columns to the `CREATE TABLE` statement in `src/database/database.service.ts` and the DTOs, and push: Light Cloud redeploys on every push.

## License

MIT, see [LICENSE](./LICENSE).
