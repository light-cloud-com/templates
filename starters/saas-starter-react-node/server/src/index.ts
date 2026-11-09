import { config } from "./config.ts";
import { runMigrations } from "./db/migrate.ts";
import { pool } from "./db/index.ts";
import { createApp } from "./app.ts";

// Migrate before listening, so no request ever sees an old schema.
await runMigrations();
console.log("Database is up to date");

const server = createApp().listen(config.port, () => {
  console.log(`Listening on port ${config.port}`);
});

const shutdown = () => {
  server.close(() => void pool.end().then(() => process.exit(0)));
  setTimeout(() => process.exit(0), 10_000).unref();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
