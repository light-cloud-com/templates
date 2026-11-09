import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// pg reads sslmode from DATABASE_URL. Light Cloud's URL carries sslmode=require&uselibpqcompat=true:
// TLS on, certificate not verified (libpq semantics). A local URL without sslmode connects in plain text.
function createPool() {
  // connectionTimeoutMillis: without it a request waits forever when the database is unreachable.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 5000 });
  // An idle connection dropped by the server must not crash the app; the pool replaces it.
  pool.on("error", (err) => console.error(`Database connection lost: ${err.message}`));
  return pool;
}

// Reuse one pool across dev hot reloads instead of opening a new one per reload.
const globalForDb = globalThis as unknown as { pool?: Pool };
export const pool = globalForDb.pool ?? (globalForDb.pool = createPool());
export const db = drizzle(pool, { schema });
export { schema };
