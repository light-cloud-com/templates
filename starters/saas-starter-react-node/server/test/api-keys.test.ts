import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { defaultKeyHasher } from "@better-auth/api-key";

// Keys are stored as this hash; the plaintext is shown once and never saved.
describe("API key hashing", () => {
  const key = "sk_exampleexampleexampleexample";

  it("is SHA-256, base64url, without the plaintext", async () => {
    const hashed = await defaultKeyHasher(key);
    expect(hashed).toBe(createHash("sha256").update(key).digest("base64url"));
    expect(hashed).not.toContain(key);
  });

  it("is deterministic, so a presented key can be looked up", async () => {
    expect(await defaultKeyHasher(key)).toBe(await defaultKeyHasher(key));
    expect(await defaultKeyHasher(key)).not.toBe(await defaultKeyHasher(`${key}x`));
  });
});
