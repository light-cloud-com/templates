import { config } from "../config.ts";

const first = (value: string | null) => value?.split(",")[0]?.trim() || undefined;

// Same rule as Better Auth with trustedProxyHeaders: APP_URL, else the
// forwarded host and protocol, else the request's own.
export function baseUrlFrom(request: Request | undefined): string {
  if (config.appUrl) return config.appUrl;
  if (!request) return `http://localhost:${config.port}`;
  const url = new URL(request.url);
  const host = first(request.headers.get("x-forwarded-host")) ?? url.host;
  const proto = first(request.headers.get("x-forwarded-proto")) ?? url.protocol.slice(0, -1);
  return `${proto}://${host}`;
}
