const http = require('node:http');
const handler = require('./app');
const config = require('./config');

const server = http.createServer(handler);

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

// The container runs node as PID 1, which ignores SIGTERM unless the app
// handles it. Light Cloud (Cloud Run) sends SIGTERM before stopping an instance.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
