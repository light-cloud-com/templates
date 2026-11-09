const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to your Express API',
    endpoints: { root: '/', health: '/health' },
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
