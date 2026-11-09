import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

/** Starts the app on a free port and returns a tiny cookie-keeping client. */
export async function startApp() {
  const { createApp } = await import("../src/app.ts");
  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { base, server, close: () => new Promise<void>((r) => server.close(() => r())) };
}

export function client(base: string) {
  let cookie = "";
  return async (path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) => {
    const res = await fetch(base + path, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: {
        origin: base,
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(cookie ? { cookie } : {}),
        ...init.headers,
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const set = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
    if (set) cookie = set;
    const text = await res.text();
    let json: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    try { json = JSON.parse(text); } catch { /* not JSON */ }
    return { status: res.status, json, text, headers: res.headers };
  };
}
