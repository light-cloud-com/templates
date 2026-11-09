import { Hono } from 'hono';

// A sub-app per group of routes; app.js mounts it with app.route().
const root = new Hono();

root.get('/', (c) =>
  c.json({
    message: 'Welcome to your Hono API',
    endpoints: { root: '/', health: '/health' },
  })
);

root.get('/health', (c) =>
  c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
);

export default root;
