import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import pg from 'pg';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  // Light Cloud sets DATABASE_URL with sslmode=require&uselibpqcompat=true:
  // TLS on, certificate not verified (the database's certificate is platform-internal).
  // connectionTimeoutMillis: without it a request waits forever when the database is unreachable.
  readonly pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 5000,
  });

  constructor() {
    // An idle connection dropped by the server must not crash the app; the pool replaces it.
    this.pool.on('error', (err) => console.error(`Database connection lost: ${err.message}`));
  }

  // Creates the table on start. If the database is unreachable the app does not start.
  async onModuleInit() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
  }

  onModuleDestroy() {
    return this.pool.end();
  }
}
