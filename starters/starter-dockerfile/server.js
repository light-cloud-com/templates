const http = require('http');

const PORT = process.env.PORT || 8080;
const startTime = Date.now();

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/') {
    res.end(JSON.stringify({
      message: 'Welcome to your Custom API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        root: '/'
      }
    }));
  } else if (req.url === '/health') {
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - startTime) / 1000
    }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
