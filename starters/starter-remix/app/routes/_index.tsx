import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | Remix App" },
    { name: "description", content: "A Remix starter rendered on a server by Light Cloud." },
  ];
};

// Runs on the server for every request to /.
export const loader = () => json({ renderedAt: new Date().toISOString() });

export default function Index() {
  const { renderedAt } = useLoaderData<typeof loader>();

  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-bold">Welcome to Remix</h1>
      <p>
        This page is rendered on the server. Edit <code>app/routes/_index.tsx</code> and save to
        see the change.
      </p>
      <p>
        Rendered at <time>{renderedAt}</time>. The resource route at{" "}
        <a className="text-blue-700 underline" href="/api/health">
          /api/health
        </a>{" "}
        answers with JSON.
      </p>
    </section>
  );
}
