const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to your Express API',
    endpoints: { root: '/', health: '/health' },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Unmatched routes answer in JSON rather than Express's HTML error page, so a
// client parsing responses gets the same shape from every route.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
