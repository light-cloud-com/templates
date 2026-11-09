import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <section>
      <h1>About</h1>
      <p>
        Pages live in <code>app/</code>, one folder per route. Shared UI lives in{" "}
        <code>components/</code>, and API endpoints are route handlers such as{" "}
        <code>app/api/health/route.ts</code>.
      </p>
    </section>
  );
}
