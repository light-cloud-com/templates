import express from "express";
import { errorHandler, notFound } from "./middleware/errors.js";
import { indexRouter } from "./routes/index.js";
import { itemsRouter } from "./routes/items.js";

// Builds the app around a database pool, without listening, so tests can
// pass their own pool and start it on any port.
export function createApp(pool) {
  const app = express();
  app.use(express.json());
  app.use(indexRouter(pool));
  app.use("/items", itemsRouter(pool));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
