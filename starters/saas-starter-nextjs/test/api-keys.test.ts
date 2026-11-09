import { describe, expect, it } from "vitest";
import { API_KEY_PREFIX, generateApiKey, hashApiKey, readBearerKey } from "@/lib/api-keys";

describe("API keys", () => {
  it("generates unique, prefixed keys and stores only a hash", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.key.startsWith(API_KEY_PREFIX)).toBe(true);
    expect(a.key).not.toBe(b.key);
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(a.hash).not.toContain(a.key);
    expect(a.key.startsWith(a.start)).toBe(true);
  });

  it("verifies a key by hashing it again", () => {
    const { key, hash } = generateApiKey();
    expect(hashApiKey(key)).toBe(hash);
    expect(hashApiKey(key + "x")).not.toBe(hash);
  });

  it("reads only well-formed bearer tokens", () => {
    const { key } = generateApiKey();
    expect(readBearerKey(`Bearer ${key}`)).toBe(key);
    expect(readBearerKey(`bearer ${key}`)).toBe(key);
    expect(readBearerKey(key)).toBeNull();
    expect(readBearerKey("Bearer not-our-key")).toBeNull();
    expect(readBearerKey(null)).toBeNull();
  });
});
