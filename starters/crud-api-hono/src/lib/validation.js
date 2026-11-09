export const MAX_ID = 2147483647; // the id column is a 32-bit SERIAL

// Returns { name, description } or { error } for a request body.
export function parseItem(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = body?.description ?? null;
  if (name.length < 1 || name.length > 200) {
    return { error: "name is required and must be 1 to 200 characters" };
  }
  if (description !== null && typeof description !== "string") {
    return { error: "description must be a string" };
  }
  return { name, description };
}

// A whole number in [min, max], the fallback when absent, or null when invalid.
export function intParam(value, fallback, min, max) {
  if (value === undefined) return fallback;
  const n = Number(value);
  return /^\d+$/.test(value) && n >= min && n <= max ? n : null;
}
