// HTTP tests with a fake pool: no database needed.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

const queries = [];
let databaseUp = true;
const fakePool = {
  async query(text, values) {
    if (!databaseUp) throw new Error("connection refused");
    queries.push({ text, values });
    return { rows: [], rowCount: 0 };
  },
};

const server = createApp(fakePool).listen(0);
await new Promise((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
after(() => server.close());

const json = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

test("GET / lists the routes", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.ok((await res.json()).routes.includes("GET /items/:id"));
});

test("GET /health is 200 when the database answers and 503 when it does not", async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
  databaseUp = false;
  try {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: "Database unavailable" });
  } finally {
    databaseUp = true;
  }
});

test("GET /items pages with limit 20 and offset 0 by default", async () => {
  queries.length = 0;
  const res = await fetch(`${base}/items`);
  assert.equal(res.status, 200);
  assert.deepEqual(queries[0].values, [20, 0]);
});

test("GET /items rejects a limit above 100", async () => {
  assert.equal((await fetch(`${base}/items?limit=101`)).status, 400);
});

test("POST /items rejects an invalid item or body", async () => {
  assert.equal((await json("POST", "/items", { name: "" })).status, 400);
  const res = await json("POST", "/items", "{");
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "Invalid request body" });
});

test("impossible ids and unknown routes are 404", async () => {
  assert.equal((await fetch(`${base}/items/abc`)).status, 404);
  assert.equal((await fetch(`${base}/items/99999999999`)).status, 404);
  assert.equal((await fetch(`${base}/items/1`)).status, 404); // the fake pool finds nothing
  assert.equal((await fetch(`${base}/nope`)).status, 404);
});
