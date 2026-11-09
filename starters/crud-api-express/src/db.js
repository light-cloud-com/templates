import pg from "pg";

export function createPool(connectionString) {
  // connectionTimeoutMillis: without it a request waits forever when the database is unreachable.
  const pool = new pg.Pool({ connectionString, max: 5, connectionTimeoutMillis: 5000 });
  // An idle connection dropped by the server must not crash the app; the pool replaces it.
  pool.on("error", (err) => console.error(`Database connection lost: ${err.message}`));
  return pool;
}

// The app creates its table on start, so there is no migration step.
export async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
}
