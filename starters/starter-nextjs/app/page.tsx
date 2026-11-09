import Image from "next/image";

export default function Home() {
  return (
    <section>
      <Image src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
      <h1>Welcome to Next.js</h1>
      <p>
        This page is rendered on the server on every request. Edit{" "}
        <code>app/page.tsx</code> and save to see the change.
      </p>
      <p>
        Rendered at <time>{new Date().toISOString()}</time>. The API route at{" "}
        <a href="/api/health">/api/health</a> answers with JSON.
      </p>
    </section>
  );
}

// Render per request instead of prerendering at build time.
export const dynamic = "force-dynamic";
