import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { createSql, ensureSchema } from "./db.js";

const sql = createSql(config.databaseUrl);

// Create the table on start, then listen. No database means no app: fail loudly.
try {
  await ensureSchema(sql);
} catch (err) {
  console.error(`Could not reach the database: ${err.message}`);
  process.exit(1);
}

const server = serve({ fetch: createApp(sql).fetch, port: config.port }, () =>
  console.log(`Listening on port ${config.port}`)
);

// Light Cloud (Cloud Run) sends SIGTERM before stopping an instance: finish
// in-flight requests, close the database client, then exit.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await sql.end();
      process.exit(0);
    });
  });
}
