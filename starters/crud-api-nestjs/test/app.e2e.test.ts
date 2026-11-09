// HTTP tests with the database replaced by a fake pool: no database needed.
import 'reflect-metadata';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { DatabaseService } from '../src/database/database.service.js';

const queries: { text: string; values?: unknown[] }[] = [];
let databaseUp = true;
const fakeDatabase = {
  pool: {
    async query(text: string, values?: unknown[]) {
      if (!databaseUp) throw new Error('connection refused');
      queries.push({ text, values });
      return { rows: [], rowCount: 0 };
    },
  },
};

let app: INestApplication;
let base: string;

before(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DatabaseService)
    .useValue(fakeDatabase)
    .compile();
  app = configureApp(moduleRef.createNestApplication({ logger: false }));
  await app.listen(0, '127.0.0.1');
  base = await app.getUrl();
});

after(() => app.close());

const send = (method: string, path: string, body: unknown) =>
  fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

test('GET / lists the routes', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.ok((await res.json()).routes.includes('GET /items/:id'));
});

test('GET /health is 200 when the database answers and 503 when it does not', async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
  databaseUp = false;
  try {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: 'Database unavailable' });
  } finally {
    databaseUp = true;
  }
});

test('GET /items pages with limit 20 and offset 0 by default', async () => {
  queries.length = 0;
  const res = await fetch(`${base}/items`);
  assert.equal(res.status, 200);
  assert.deepEqual(queries[0].values, [20, 0]);
});

test('GET /items rejects a limit above 100', async () => {
  assert.equal((await fetch(`${base}/items?limit=101`)).status, 400);
});

test('POST /items rejects an invalid item', async () => {
  const res = await send('POST', '/items', { name: '' });
  assert.equal(res.status, 400);
  assert.equal(typeof (await res.json()).error, 'string');
});

test('impossible ids and unknown routes are 404', async () => {
  assert.equal((await fetch(`${base}/items/abc`)).status, 404);
  assert.equal((await fetch(`${base}/items/99999999999`)).status, 404);
  assert.equal((await fetch(`${base}/items/1`)).status, 404); // the fake pool finds nothing
  assert.equal((await fetch(`${base}/nope`)).status, 404);
});

test('GET /docs serves the OpenAPI docs', async () => {
  assert.equal((await fetch(`${base}/docs`)).status, 200);
});
