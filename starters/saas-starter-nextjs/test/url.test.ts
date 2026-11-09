import { describe, expect, it } from "vitest";
import { baseUrl, isSameOrigin, safeNext } from "@/lib/url";

describe("baseUrl", () => {
  it("uses the proxy's forwarded host and protocol", () => {
    const h = new Headers({ host: "internal:8080", "x-forwarded-host": "app.example.com", "x-forwarded-proto": "https" });
    expect(baseUrl(h)).toBe("https://app.example.com");
  });

  it("falls back to the Host header, http on localhost", () => {
    expect(baseUrl(new Headers({ host: "localhost:3000" }))).toBe("http://localhost:3000");
    expect(baseUrl(new Headers({ host: "app.example.com" }))).toBe("https://app.example.com");
  });

  it("rejects hosts that are not hostnames", () => {
    expect(() => baseUrl(new Headers({ host: "evil.com/path" }))).toThrow();
  });
});

describe("safeNext", () => {
  it("keeps same-site paths and drops everything else", () => {
    expect(safeNext("/invite/abc")).toBe("/invite/abc");
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext(null, "/onboarding")).toBe("/onboarding");
  });
});

describe("isSameOrigin", () => {
  const base = "https://app.example.com/api/auth";
  it("accepts relative paths and the app's own origin", () => {
    expect(isSameOrigin("/dashboard", base)).toBe(true);
    expect(isSameOrigin("https://app.example.com/settings", base)).toBe(true);
  });
  it("rejects other origins, protocol-relative and scheme tricks", () => {
    expect(isSameOrigin("https://evil.com", base)).toBe(false);
    expect(isSameOrigin("http://app.example.com", base)).toBe(false);
    expect(isSameOrigin("//evil.com", base)).toBe(false);
    expect(isSameOrigin("javascript:alert(1)", base)).toBe(false);
  });
});
