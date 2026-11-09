import { Hono } from "hono";
import { indexRoutes } from "./routes/index.js";
import { itemsRoutes } from "./routes/items.js";

// Builds the app around a postgres.js client, without listening, so tests can
// pass their own client and call app.request().
export function createApp(sql) {
  const app = new Hono();

  app.route("/", indexRoutes(sql));
  app.route("/items", itemsRoutes(sql));

  app.notFound((c) => c.json({ error: "Not found" }, 404));
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Something went wrong" }, 500);
  });

  return app;
}
