// Runs the full CRUD flow against a real PostgreSQL when DATABASE_URL is set:
//   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { createSql, ensureSchema } from "../src/db.js";

const skip = !process.env.DATABASE_URL && "DATABASE_URL is not set";
let sql;
let app;

before(async () => {
  if (skip) return;
  sql = createSql(process.env.DATABASE_URL);
  await ensureSchema(sql);
  app = createApp(sql);
});

after(() => sql?.end());

test("create, read, update and delete an item", { skip }, async () => {
  const send = (method, path, body) =>
    app.request(path, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

  const created = await send("POST", "/items", { name: "Test item", description: "Hello" });
  assert.equal(created.status, 201);
  const item = await created.json();
  assert.equal(item.name, "Test item");

  assert.equal((await (await app.request(`/items/${item.id}`)).json()).description, "Hello");

  const updated = await send("PUT", `/items/${item.id}`, { name: "Renamed" });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).description, null);

  const page = await (await app.request("/items?limit=100")).json();
  assert.ok(page.some((row) => row.id === item.id));

  assert.equal((await app.request(`/items/${item.id}`, { method: "DELETE" })).status, 204);
  assert.equal((await app.request(`/items/${item.id}`)).status, 404);
});
