import { Router } from "express";

export function indexRouter(pool) {
  const router = Router();

  router.get("/", (req, res) => {
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

  router.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ error: "Database unavailable" });
    }
  });

  return router;
}
