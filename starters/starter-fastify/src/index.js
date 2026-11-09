const Fastify = require('fastify');

const app = Fastify({ logger: true });

app.get('/', async () => ({
  message: 'Welcome to your Fastify API',
  endpoints: { root: '/', health: '/health' },
}));

app.get('/health', async () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// Fastify listens on localhost by default, which is unreachable from outside
// the container — Cloud Run sends traffic to the container's own address.
app
  .listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
