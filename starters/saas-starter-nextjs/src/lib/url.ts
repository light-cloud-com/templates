import { config } from "./config";

const HOST = /^[a-z0-9.-]+(:\d{1,5})?$/i;

/**
 * The public origin of the app, e.g. https://my-app.light-cloud.io. APP_URL wins when set; otherwise it
 * comes from the request, because the URL is not known before the first deploy and Cloud Run sits
 * behind a proxy that passes the public host in x-forwarded-host.
 */
export function baseUrl(headers: Headers): string {
  if (config.appUrl) return config.appUrl;
  const host = first(headers.get("x-forwarded-host")) ?? first(headers.get("host"));
  if (!host || !HOST.test(host)) throw new Error("Cannot tell the app's URL from the request; set APP_URL.");
  const proto = first(headers.get("x-forwarded-proto")) ?? (/^(localhost|127\.)/.test(host) ? "http" : "https");
  return `${proto === "http" ? "http" : "https"}://${host}`;
}

const first = (value: string | null) => value?.split(",")[0].trim() || undefined;

/** A same-site path to go to after sign-in; anything else (other hosts, `//evil.com`) falls back. */
export function safeNext(value: unknown, fallback = "/dashboard") {
  return typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : fallback;
}

/** True for a same-site relative path or an absolute URL on `base`'s origin. */
export function isSameOrigin(url: string, base: string) {
  if (/^\/(?![/\\])/.test(url)) return true;
  try {
    return new URL(url).origin === new URL(base).origin;
  } catch {
    return false;
  }
}
