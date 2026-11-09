import { Hono } from 'hono';
import root from './routes/root.js';

// The app is built here and started in server.js, so tests can call
// app.request() without opening a port.
const app = new Hono();

app.route('/', root);

// Unmatched routes and errors answer in JSON, like every other route.
app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
