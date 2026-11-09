const buildApp = require('./app');
const config = require('./config');

const app = buildApp({ logger: true });

app.listen({ port: config.port, host: config.host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

// Light Cloud (Cloud Run) sends SIGTERM before stopping an instance: finish
// in-flight requests, then exit.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, async () => {
    app.log.info(`${signal} received, shutting down`);
    await app.close();
    process.exit(0);
  });
}
