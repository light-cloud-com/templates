import path from "node:path";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { config } from "../config.ts";

const LOCK_ID = 727_001; // any constant; shared by every instance of this app

// Applies server/drizzle/*.sql that have not run yet. Instances starting at
// the same time wait on an advisory lock instead of racing.
export async function runMigrations(): Promise<void> {
  const client = new pg.Client({ connectionString: config.databaseUrl });
  await client.connect();
  try {
    await client.query("select pg_advisory_lock($1)", [LOCK_ID]);
    await migrate(drizzle(client), { migrationsFolder: path.resolve(process.cwd(), "server/drizzle") });
  } finally {
    await client.query("select pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    await client.end();
  }
}
