import { expect, it } from "vitest";
import { allow, clientIp } from "@/lib/rate-limit";

it("allows max attempts per window, then blocks until the window resets", () => {
  const t = 1_000_000;
  for (let i = 0; i < 3; i++) expect(allow("k", 3, 60_000, t)).toBe(true);
  expect(allow("k", 3, 60_000, t + 1)).toBe(false);
  expect(allow("other", 3, 60_000, t + 1)).toBe(true);
  expect(allow("k", 3, 60_000, t + 60_000)).toBe(true);
});

it("reads the client IP from the proxy header", () => {
  expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
  expect(clientIp(new Headers())).toBe("unknown");
});
