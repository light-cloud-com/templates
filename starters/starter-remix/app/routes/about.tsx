import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "About | Remix App" }];

export default function About() {
  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-bold">About</h1>
      <p>
        Routes live in <code>app/routes</code>, named by URL (<code>about.tsx</code> is{" "}
        <code>/about</code>). Shared UI lives in <code>app/components</code>, and a route with
        only a <code>loader</code>, such as <code>api.health.ts</code>, is an API endpoint.
      </p>
    </section>
  );
}
