import express from "express";
import pg from "pg";

const PORT = Number(process.env.PORT) || 8080;
const MAX_ID = 2147483647; // the id column is a 32-bit SERIAL

// Light Cloud sets DATABASE_URL with sslmode=require&uselibpqcompat=true:
// TLS on, certificate not verified (the database's certificate is platform-internal).
// connectionTimeoutMillis: without it a request waits forever when the database is unreachable.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000 });
// An idle connection dropped by the server must not crash the app; the pool replaces it.
pool.on("error", (err) => console.error(`Database connection lost: ${err.message}`));

const COLUMNS = "id, name, description, created_at, updated_at";

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

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "CRUD API (Express)",
    routes: [
      "GET /health",
      "GET /items?limit=20&offset=0",
      "GET /items/:id",
      "POST /items",
      "PUT /items/:id",
      "DELETE /items/:id",
    ],
  });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ error: "Database unavailable" });
  }
});

app.get("/items", async (req, res) => {
  const limit = intParam(req.query.limit, 20, 1, 100);
  const offset = intParam(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);
  if (limit === null || offset === null) {
    return res.status(400).json({ error: "limit must be 1 to 100 and offset 0 or more" });
  }
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM items ORDER BY id LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  res.json(rows);
});

app.post("/items", async (req, res) => {
  const item = parseItem(req.body);
  if (item.error) return res.status(400).json(item);
  const { rows } = await pool.query(
    `INSERT INTO items (name, description) VALUES ($1, $2) RETURNING ${COLUMNS}`,
    [item.name, item.description]
  );
  res.status(201).json(rows[0]);
});

// Every /items/:id route: unknown or impossible ids are 404.
app.param("id", (req, res, next, id) => {
  req.itemId = intParam(id, null, 1, MAX_ID);
  if (req.itemId === null) return res.status(404).json({ error: "Item not found" });
  next();
});

app.get("/items/:id", async (req, res) => {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM items WHERE id = $1`, [req.itemId]);
  if (!rows[0]) return res.status(404).json({ error: "Item not found" });
  res.json(rows[0]);
});

app.put("/items/:id", async (req, res) => {
  const item = parseItem(req.body);
  if (item.error) return res.status(400).json(item);
  const { rows } = await pool.query(
    `UPDATE items SET name = $1, description = $2, updated_at = now()
     WHERE id = $3 RETURNING ${COLUMNS}`,
    [item.name, item.description, req.itemId]
  );
  if (!rows[0]) return res.status(404).json({ error: "Item not found" });
  res.json(rows[0]);
});

app.delete("/items/:id", async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM items WHERE id = $1", [req.itemId]);
  if (!rowCount) return res.status(404).json({ error: "Item not found" });
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Express 5 sends errors thrown in async handlers here.
app.use((err, req, res, next) => {
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: "Invalid request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// Create the table on start, then listen. No database means no app: fail loudly.
try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
} catch (err) {
  console.error(`Could not reach the database: ${err.message}`);
  process.exit(1);
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
