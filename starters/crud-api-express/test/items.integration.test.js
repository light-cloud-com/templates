// Runs the full CRUD flow against a real PostgreSQL when DATABASE_URL is set:
//   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { createPool, ensureSchema } from "../src/db.js";

const skip = !process.env.DATABASE_URL && "DATABASE_URL is not set";
let pool;
let server;
let base;

before(async () => {
  if (skip) return;
  pool = createPool(process.env.DATABASE_URL);
  await ensureSchema(pool);
  server = createApp(pool).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await pool?.end();
});

test("create, read, update and delete an item", { skip }, async () => {
  const send = (method, path, body) =>
    fetch(base + path, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

  const created = await send("POST", "/items", { name: "Test item", description: "Hello" });
  assert.equal(created.status, 201);
  const item = await created.json();
  assert.equal(item.name, "Test item");

  assert.equal((await (await fetch(`${base}/items/${item.id}`)).json()).description, "Hello");

  const updated = await send("PUT", `/items/${item.id}`, { name: "Renamed" });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).description, null);

  const page = await (await fetch(`${base}/items?limit=100`)).json();
  assert.ok(page.some((row) => row.id === item.id));

  assert.equal((await fetch(`${base}/items/${item.id}`, { method: "DELETE" })).status, 204);
  assert.equal((await fetch(`${base}/items/${item.id}`)).status, 404);
});
