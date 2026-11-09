import { createHash, randomBytes } from "node:crypto";

// Keys are 32 random bytes, so a plain SHA-256 is enough to store them (no salt or slow hash needed:
// there is nothing to brute-force). Only the hash and a short visible prefix are kept.
export const API_KEY_PREFIX = "sk_live_";

export function generateApiKey() {
  const key = API_KEY_PREFIX + randomBytes(32).toString("base64url");
  return { key, hash: hashApiKey(key), start: key.slice(0, API_KEY_PREFIX.length + 4) };
}

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

/** Reads `Authorization: Bearer <key>`; null when missing or not one of our keys. */
export function readBearerKey(authorization: string | null): string | null {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  return match && match[1].startsWith(API_KEY_PREFIX) ? match[1] : null;
}
