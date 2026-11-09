import { Router } from "express";
import { MAX_ID, intParam, parseItem } from "../lib/validation.js";

const COLUMNS = "id, name, description, created_at, updated_at";

export function itemsRouter(pool) {
  const router = Router();

  router.get("/", async (req, res) => {
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

  router.post("/", async (req, res) => {
    const item = parseItem(req.body);
    if (item.error) return res.status(400).json(item);
    const { rows } = await pool.query(
      `INSERT INTO items (name, description) VALUES ($1, $2) RETURNING ${COLUMNS}`,
      [item.name, item.description]
    );
    res.status(201).json(rows[0]);
  });

  // Every /items/:id route: unknown or impossible ids are 404.
  router.param("id", (req, res, next, id) => {
    req.itemId = intParam(id, null, 1, MAX_ID);
    if (req.itemId === null) return res.status(404).json({ error: "Item not found" });
    next();
  });

  router.get("/:id", async (req, res) => {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM items WHERE id = $1`, [req.itemId]);
    if (!rows[0]) return res.status(404).json({ error: "Item not found" });
    res.json(rows[0]);
  });

  router.put("/:id", async (req, res) => {
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

  router.delete("/:id", async (req, res) => {
    const { rowCount } = await pool.query("DELETE FROM items WHERE id = $1", [req.itemId]);
    if (!rowCount) return res.status(404).json({ error: "Item not found" });
    res.status(204).end();
  });

  return router;
}
