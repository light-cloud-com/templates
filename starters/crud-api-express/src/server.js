import { createApp } from "./app.js";
import { config } from "./config.js";
import { createPool, ensureSchema } from "./db.js";

const pool = createPool(config.databaseUrl);

// Create the table on start, then listen. No database means no app: fail loudly.
try {
  await ensureSchema(pool);
} catch (err) {
  console.error(`Could not reach the database: ${err.message}`);
  process.exit(1);
}

const server = createApp(pool).listen(config.port, () => {
  console.log(`Listening on port ${config.port}`);
});

// Light Cloud (Cloud Run) sends SIGTERM before stopping an instance: finish
// in-flight requests, close the pool, then exit.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}
