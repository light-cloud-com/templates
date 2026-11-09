// HTTP tests with a fake postgres.js client: no database needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

const queries = [];
let databaseUp = true;
// postgres.js is called as a tagged template: sql`...${value}...`.
const fakeSql = async (strings, ...values) => {
  if (!databaseUp) throw new Error("connection refused");
  queries.push({ text: strings.join("?"), values });
  return Object.assign([], { count: 0 });
};

const app = createApp(fakeSql);
const json = (method, path, body) =>
  app.request(path, {
    method,
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

test("GET / lists the routes", async () => {
  const res = await app.request("/");
  assert.equal(res.status, 200);
  assert.ok((await res.json()).routes.includes("GET /items/:id"));
});

test("GET /health is 200 when the database answers and 503 when it does not", async () => {
  assert.equal((await app.request("/health")).status, 200);
  databaseUp = false;
  try {
    const res = await app.request("/health");
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: "Database unavailable" });
  } finally {
    databaseUp = true;
  }
});

test("GET /items pages with limit 20 and offset 0 by default", async () => {
  queries.length = 0;
  const res = await app.request("/items");
  assert.equal(res.status, 200);
  assert.deepEqual(queries[0].values, [20, 0]);
});

test("GET /items rejects a limit above 100", async () => {
  assert.equal((await app.request("/items?limit=101")).status, 400);
});

test("POST /items rejects an invalid item or body", async () => {
  assert.equal((await json("POST", "/items", { name: "" })).status, 400);
  const res = await json("POST", "/items", "{");
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "Invalid request body" });
});

test("impossible ids and unknown routes are 404", async () => {
  assert.equal((await app.request("/items/abc")).status, 404);
  assert.equal((await app.request("/items/99999999999")).status, 404);
  assert.equal((await app.request("/items/1")).status, 404); // the fake client finds nothing
  assert.equal((await app.request("/nope")).status, 404);
});

test("errors thrown in a route answer 500 in JSON", async () => {
  const broken = createApp(async () => {
    throw new Error("boom");
  });
  const res = await broken.request("/items");
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: "Something went wrong" });
});
