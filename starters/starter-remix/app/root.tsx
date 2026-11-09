import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import SiteHeader from "~/components/SiteHeader";
import "./tailwind.css";

export const loader = () => json({ siteName: process.env.SITE_NAME || "Remix App" });

export function Layout({ children }: { children: React.ReactNode }) {
  // Undefined when the root loader itself failed and the error boundary renders.
  const data = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans text-slate-800">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6">
          <SiteHeader siteName={data?.siteName ?? "Remix App"} />
          <main className="flex-1 py-12">{children}</main>
          <footer className="border-t border-slate-200 py-6 text-sm text-slate-500">
            Deployed with Light Cloud
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
