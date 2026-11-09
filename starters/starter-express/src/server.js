const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`Listening on port ${config.port}`);
});

// Light Cloud (Cloud Run) sends SIGTERM before stopping an instance: finish
// in-flight requests, then exit.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
