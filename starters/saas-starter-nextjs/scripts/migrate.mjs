// Applies the SQL migrations in drizzle/ before the server starts (`npm start` runs this first).
// Drizzle records applied migrations in drizzle.__drizzle_migrations, so running it again is a no-op.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { existsSync } from "node:fs";
import pg from "pg";

// Locally, read the same env files Next.js does; on Light Cloud the variables are already set.
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Start a PostgreSQL database and point DATABASE_URL at it.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
await client.connect();
try {
  // Several instances can start at once; the advisory lock lets one migrate while the others wait.
  await client.query("select pg_advisory_lock(727274)");
  await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  console.log("Database migrations are up to date.");
} finally {
  await client.end();
}
