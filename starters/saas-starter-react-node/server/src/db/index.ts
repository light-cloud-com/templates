import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config.ts";
import * as schema from "./schema.ts";

if (!config.databaseUrl) throw new Error("DATABASE_URL is not set.");

// node-postgres reads sslmode/uselibpqcompat from the URL: on Light Cloud that
// is TLS without certificate verification, locally plain TCP.
export const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10, connectionTimeoutMillis: 5_000 });
// An idle connection dropped by the database (restart, failover) must not crash the server.
pool.on("error", (err) => console.error("[db] idle connection error:", err.message));
export const db = drizzle(pool, { schema });
export type DB = typeof db;
