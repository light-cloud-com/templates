const Fastify = require('fastify');
const rootRoutes = require('./routes/root');

// Builds the app without listening, so tests can call it with app.inject().
// Fastify answers unknown routes and thrown errors in JSON on its own.
function buildApp(options = {}) {
  const app = Fastify(options);
  app.register(rootRoutes);
  return app;
}

module.exports = buildApp;
