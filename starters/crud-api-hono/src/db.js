import postgres from "postgres";

// Light Cloud sets DATABASE_URL with sslmode=require (TLS on, certificate not
// verified) plus parameters for other clients. postgres.js would pass those to
// the server as settings, which it rejects, so they are dropped here.
export function createSql(databaseUrl) {
  const url = new URL(databaseUrl);
  url.searchParams.delete("uselibpqcompat");
  url.searchParams.delete("sslaccept");
  return postgres(url.href, { max: 5, connect_timeout: 5, onnotice: () => {} });
}

// The app creates its table on start, so there is no migration step.
export async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
}
