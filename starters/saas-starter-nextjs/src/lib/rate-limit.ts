// Fixed-window, in-memory rate limiter for the sign-in, sign-up and password forms. They run as server
// actions that call auth.api directly, which skips Better Auth's own limiter (that one only guards
// HTTP calls to /api/auth/*).
// shortcut: memory is per instance, so N instances allow N times the limit; move to Redis or the
// database (Better Auth's rateLimit.storage) when you scale out.
const hits = new Map<string, { count: number; resetAt: number }>();

/** Counts one attempt for `key`; false once `max` attempts were made inside `windowMs`. */
export function allow(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

/** The caller's IP as the proxy reports it (first x-forwarded-for entry). */
export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}
