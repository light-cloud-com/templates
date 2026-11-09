// Smoke test against a running app: `npm run smoke` (BASE_URL defaults to http://localhost:3000).
// Checks the public pages, health, a real sign-up over HTTP, the signed-in redirect and the API's auth.
const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL ${name}: ${err.message}`);
  }
}

function expectStatus(res, status) {
  if (res.status !== status) throw new Error(`expected ${status}, got ${res.status}`);
}

for (const path of ["/", "/pricing", "/terms", "/privacy", "/sign-in", "/sign-up"]) {
  await check(`GET ${path}`, async () => expectStatus(await fetch(base + path), 200));
}
await check("GET /api/health", async () => expectStatus(await fetch(`${base}/api/health`), 200));

let cookie = "";
await check("sign up over HTTP", async () => {
  const email = `smoke-${Date.now()}@example.com`;
  const res = await fetch(`${base}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ name: "Smoke Test", email, password: "smoke-test-password" }),
  });
  expectStatus(res, 200);
  cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  if (!cookie) throw new Error("no session cookie (is email verification on? then sign-up waits for the email)");
});
await check("new user is sent to onboarding", async () => {
  const res = await fetch(`${base}/dashboard`, { headers: { cookie }, redirect: "manual" });
  if (!res.headers.get("location")?.endsWith("/onboarding")) throw new Error(`redirected to ${res.headers.get("location")}`);
});
await check("API rejects a missing key", async () => expectStatus(await fetch(`${base}/api/v1/projects`), 401));

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
