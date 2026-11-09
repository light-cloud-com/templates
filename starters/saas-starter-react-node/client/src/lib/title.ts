import { useEffect } from "react";
import { useAppConfig } from "./queries";

/** Sets the tab title to "Page | App name"; without a page, the app's own title. */
export function useTitle(page?: string | null) {
  const app = useAppConfig().data?.appName ?? "Acme";
  useEffect(() => {
    document.title = page ? `${page} | ${app}` : `${app}: the SaaS starter for React and Node.js`;
  }, [page, app]);
}
