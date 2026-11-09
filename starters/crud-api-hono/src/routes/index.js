import { Hono } from "hono";

export function indexRoutes(sql) {
  const routes = new Hono();

  routes.get("/", (c) =>
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

  routes.get("/health", async (c) => {
    try {
      await sql`SELECT 1`;
      return c.json({ status: "ok" });
    } catch {
      return c.json({ error: "Database unavailable" }, 503);
    }
  });

  return routes;
}
