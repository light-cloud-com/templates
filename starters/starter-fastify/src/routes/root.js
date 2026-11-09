// Routes are Fastify plugins: add a file here and register it in app.js.
async function rootRoutes(app) {
  app.get('/', async () => ({
    message: 'Welcome to your Fastify API',
    endpoints: { root: '/', health: '/health' },
  }));

  app.get('/health', async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));
}

module.exports = rootRoutes;
