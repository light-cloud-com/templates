import { serve } from "@hono/node-server";
import { Hono } from "hono";
import postgres from "postgres";

const PORT = Number(process.env.PORT) || 8080;
const MAX_ID = 2147483647; // the id column is a 32-bit SERIAL

// Light Cloud sets DATABASE_URL with sslmode=require (TLS on, certificate not
// verified) plus parameters for other clients. postgres.js would pass those to
// the server as settings, which it rejects, so they are dropped here.
const url = new URL(process.env.DATABASE_URL || "postgres://localhost:5432/postgres");
url.searchParams.delete("uselibpqcompat");
url.searchParams.delete("sslaccept");
const sql = postgres(url.href, { max: 5, connect_timeout: 5, onnotice: () => {} });

// Returns { name, description } or { error } for a request body.
function parseItem(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = body?.description ?? null;
  if (name.length < 1 || name.length > 200) {
    return { error: "name is required and must be 1 to 200 characters" };
  }
  if (description !== null && typeof description !== "string") {
    return { error: "description must be a string" };
  }
  return { name, description };
}

// A whole number in [min, max], the fallback when absent, or null when invalid.
function intParam(value, fallback, min, max) {
  if (value === undefined) return fallback;
  const n = Number(value);
  return /^\d+$/.test(value) && n >= min && n <= max ? n : null;
}

async function readItem(c) {
  try {
    return parseItem(await c.req.json());
  } catch {
    return { error: "Invalid request body" };
  }
}

const notFound = (c) => c.json({ error: "Item not found" }, 404);
const itemId = (c) => intParam(c.req.param("id"), null, 1, MAX_ID);

const app = new Hono();

app.get("/", (c) =>
  c.json({
    name: "CRUD API (Hono)",
    routes: [
      "GET /health",
      "GET /items?limit=20&offset=0",
      "GET /items/:id",
      "POST /items",
      "PUT /items/:id",
      "DELETE /items/:id",
    ],
  })
);

app.get("/health", async (c) => {
  try {
    await sql`SELECT 1`;
    return c.json({ status: "ok" });
  } catch {
    return c.json({ error: "Database unavailable" }, 503);
  }
});

app.get("/items", async (c) => {
  const limit = intParam(c.req.query("limit"), 20, 1, 100);
  const offset = intParam(c.req.query("offset"), 0, 0, Number.MAX_SAFE_INTEGER);
  if (limit === null || offset === null) {
    return c.json({ error: "limit must be 1 to 100 and offset 0 or more" }, 400);
  }
  return c.json(await sql`SELECT * FROM items ORDER BY id LIMIT ${limit} OFFSET ${offset}`);
});

app.post("/items", async (c) => {
  const item = await readItem(c);
  if (item.error) return c.json(item, 400);
  const [row] = await sql`
    INSERT INTO items (name, description) VALUES (${item.name}, ${item.description}) RETURNING *`;
  return c.json(row, 201);
});

app.get("/items/:id", async (c) => {
  const id = itemId(c);
  if (id === null) return notFound(c);
  const [row] = await sql`SELECT * FROM items WHERE id = ${id}`;
  return row ? c.json(row) : notFound(c);
});

app.put("/items/:id", async (c) => {
  const id = itemId(c);
  if (id === null) return notFound(c);
  const item = await readItem(c);
  if (item.error) return c.json(item, 400);
  const [row] = await sql`
    UPDATE items SET name = ${item.name}, description = ${item.description}, updated_at = now()
    WHERE id = ${id} RETURNING *`;
  return row ? c.json(row) : notFound(c);
});

app.delete("/items/:id", async (c) => {
  const id = itemId(c);
  if (id === null) return notFound(c);
  const { count } = await sql`DELETE FROM items WHERE id = ${id}`;
  return count ? c.body(null, 204) : notFound(c);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Something went wrong" }, 500);
});

// Create the table on start, then listen. No database means no app: fail loudly.
try {
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
} catch (err) {
  console.error(`Could not reach the database: ${err.message}`);
  process.exit(1);
}

serve({ fetch: app.fetch, port: PORT }, () => console.log(`Listening on port ${PORT}`));
