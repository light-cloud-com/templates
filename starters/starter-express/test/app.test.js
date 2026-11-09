const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('GET / lists the endpoints', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.endpoints, { root: '/', health: '/health' });
});

test('GET /health reports healthy', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'healthy');
  assert.equal(typeof body.uptime, 'number');
});

test('unknown routes answer 404 in JSON', async () => {
  const res = await fetch(`${baseUrl}/nope`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Not found' });
});

test('a malformed JSON body answers 400 in JSON', async () => {
  const res = await fetch(`${baseUrl}/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  });
  assert.equal(res.status, 400);
  assert.equal(typeof (await res.json()).error, 'string');
});
