// Runs the full CRUD flow against a real PostgreSQL when DATABASE_URL is set:
//   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres npm test
import 'reflect-metadata';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

const skip = process.env.DATABASE_URL ? false : 'DATABASE_URL is not set';
let app: INestApplication | undefined;
let base: string;

before(async () => {
  if (skip) return;
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = configureApp(moduleRef.createNestApplication({ logger: false }));
  await app.listen(0, '127.0.0.1');
  base = await app.getUrl();
});

after(() => app?.close());

test('create, read, update and delete an item', { skip }, async () => {
  const send = (method: string, path: string, body: unknown) =>
    fetch(base + path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

  const created = await send('POST', '/items', { name: 'Test item', description: 'Hello' });
  assert.equal(created.status, 201);
  const item = await created.json();
  assert.equal(item.name, 'Test item');

  assert.equal((await (await fetch(`${base}/items/${item.id}`)).json()).description, 'Hello');

  const updated = await send('PUT', `/items/${item.id}`, { name: 'Renamed' });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).description, null);

  const page: { id: number }[] = await (await fetch(`${base}/items?limit=100`)).json();
  assert.ok(page.some((row) => row.id === item.id));

  assert.equal((await fetch(`${base}/items/${item.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await fetch(`${base}/items/${item.id}`)).status, 404);
});
