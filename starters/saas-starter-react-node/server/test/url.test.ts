import { describe, expect, it } from "vitest";
import { baseUrlFrom } from "../src/lib/url.ts";

describe("public URL from the request", () => {
  it("prefers the proxy's forwarded host and protocol", () => {
    const req = new Request("http://10.0.0.5:8080/api/auth/x", { headers: { "x-forwarded-host": "app.example.com", "x-forwarded-proto": "https" } });
    expect(baseUrlFrom(req)).toBe("https://app.example.com");
  });

  it("takes the first value of a forwarded chain", () => {
    const req = new Request("http://internal/", { headers: { "x-forwarded-host": "a.example.com, b.internal", "x-forwarded-proto": "https,http" } });
    expect(baseUrlFrom(req)).toBe("https://a.example.com");
  });

  it("falls back to the request's own origin", () => {
    expect(baseUrlFrom(new Request("http://localhost:8080/x"))).toBe("http://localhost:8080");
  });
});
