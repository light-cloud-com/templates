import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) =>
  c.json({
    message: 'Welcome to your Hono API',
    endpoints: { root: '/', health: '/health' },
  })
);

app.get('/health', (c) =>
  c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
);

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, ({ port: bound }) => {
  console.log(`Listening on port ${bound}`);
});
