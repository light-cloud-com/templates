import { json } from "@remix-run/node";

// A resource route: no default export, so it answers with the loader's response only.
export const loader = () => json({ status: "ok" });
