const startTime = Date.now();

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

// The request handler, kept apart from server.js so tests can start it on any port.
function handler(req, res) {
  if (req.url === '/') {
    return send(res, 200, {
      message: 'Welcome to your Custom API',
      version: '1.0.0',
      endpoints: { health: '/health', root: '/' },
    });
  }
  if (req.url === '/health') {
    return send(res, 200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - startTime) / 1000,
    });
  }
  return send(res, 404, { error: 'Not Found' });
}

module.exports = handler;
