import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('GET / lists the endpoints', async () => {
  const res = await app.request('/');
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).endpoints, { root: '/', health: '/health' });
});

test('GET /health reports healthy', async () => {
  const res = await app.request('/health');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'healthy');
  assert.equal(typeof body.uptime, 'number');
});

test('unknown routes answer 404 in JSON', async () => {
  const res = await app.request('/nope');
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Not found' });
});
