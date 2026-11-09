const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const buildApp = require('../src/app');

const app = buildApp();
after(() => app.close());

test('GET / lists the endpoints', async () => {
  const res = await app.inject({ method: 'GET', url: '/' });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json().endpoints, { root: '/', health: '/health' });
});

test('GET /health reports healthy', async () => {
  const res = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().status, 'healthy');
  assert.equal(typeof res.json().uptime, 'number');
});

test('unknown routes answer 404 in JSON', async () => {
  const res = await app.inject({ method: 'GET', url: '/nope' });
  assert.equal(res.statusCode, 404);
  assert.equal(res.json().error, 'Not Found');
});
