import { test } from "node:test";
import assert from "node:assert/strict";
import { intParam, parseItem } from "../src/lib/validation.js";

test("parseItem trims the name and defaults description to null", () => {
  assert.deepEqual(parseItem({ name: "  Box  " }), { name: "Box", description: null });
});

test("parseItem rejects a missing, empty or too long name", () => {
  assert.ok(parseItem({}).error);
  assert.ok(parseItem({ name: "   " }).error);
  assert.ok(parseItem({ name: "x".repeat(201) }).error);
});

test("parseItem rejects a description that is not a string", () => {
  assert.ok(parseItem({ name: "Box", description: 5 }).error);
});

test("intParam returns the fallback, the number, or null", () => {
  assert.equal(intParam(undefined, 20, 1, 100), 20);
  assert.equal(intParam("50", 20, 1, 100), 50);
  assert.equal(intParam("0", 20, 1, 100), null);
  assert.equal(intParam("101", 20, 1, 100), null);
  assert.equal(intParam("1.5", 20, 1, 100), null);
});
