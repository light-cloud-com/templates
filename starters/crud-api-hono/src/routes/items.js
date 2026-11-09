import { Hono } from "hono";
import { MAX_ID, intParam, parseItem } from "../lib/validation.js";

async function readItem(c) {
  try {
    return parseItem(await c.req.json());
  } catch {
    return { error: "Invalid request body" };
  }
}

const notFound = (c) => c.json({ error: "Item not found" }, 404);
// Unknown or impossible ids (not a whole number, beyond the 32-bit SERIAL) are 404.
const itemId = (c) => intParam(c.req.param("id"), null, 1, MAX_ID);

export function itemsRoutes(sql) {
  const items = new Hono();

  items.get("/", async (c) => {
    const limit = intParam(c.req.query("limit"), 20, 1, 100);
    const offset = intParam(c.req.query("offset"), 0, 0, Number.MAX_SAFE_INTEGER);
    if (limit === null || offset === null) {
      return c.json({ error: "limit must be 1 to 100 and offset 0 or more" }, 400);
    }
    return c.json(await sql`SELECT * FROM items ORDER BY id LIMIT ${limit} OFFSET ${offset}`);
  });

  items.post("/", async (c) => {
    const item = await readItem(c);
    if (item.error) return c.json(item, 400);
    const [row] = await sql`
      INSERT INTO items (name, description) VALUES (${item.name}, ${item.description}) RETURNING *`;
    return c.json(row, 201);
  });

  items.get("/:id", async (c) => {
    const id = itemId(c);
    if (id === null) return notFound(c);
    const [row] = await sql`SELECT * FROM items WHERE id = ${id}`;
    return row ? c.json(row) : notFound(c);
  });

  items.put("/:id", async (c) => {
    const id = itemId(c);
    if (id === null) return notFound(c);
    const item = await readItem(c);
    if (item.error) return c.json(item, 400);
    const [row] = await sql`
      UPDATE items SET name = ${item.name}, description = ${item.description}, updated_at = now()
      WHERE id = ${id} RETURNING *`;
    return row ? c.json(row) : notFound(c);
  });

  items.delete("/:id", async (c) => {
    const id = itemId(c);
    if (id === null) return notFound(c);
    const { count } = await sql`DELETE FROM items WHERE id = ${id}`;
    return count ? c.body(null, 204) : notFound(c);
  });

  return items;
}
