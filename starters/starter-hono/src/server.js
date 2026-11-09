import { serve } from '@hono/node-server';
import app from './app.js';
import { config } from './config.js';

const server = serve({ fetch: app.fetch, port: config.port }, ({ port }) => {
  console.log(`Listening on port ${port}`);
});

// Light Cloud (Cloud Run) sends SIGTERM before stopping an instance: finish
// in-flight requests, then exit.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
