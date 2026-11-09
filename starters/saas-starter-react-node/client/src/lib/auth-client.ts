import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { apiKeyClient } from "@better-auth/api-key/client";
import { stripeClient } from "@better-auth/stripe/client";
import { ac, roles } from "@shared/permissions.ts";

// Same origin as the page, so no base URL is needed.
export const authClient = createAuthClient({
  plugins: [
    organizationClient({ ac, roles }),
    adminClient(),
    apiKeyClient(),
    stripeClient({ subscription: true }),
    inferAdditionalFields({ user: { onboarded: { type: "boolean", input: false } } }),
  ],
});

export const { useSession, useListOrganizations, useActiveOrganization } = authClient;

/** Better Auth returns `{ data, error }`; this turns the error into a throw for TanStack Query and forms. */
export async function unwrap<T>(promise: Promise<{ data: T | null; error: { message?: string; statusText?: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message || error.statusText || "Something went wrong");
  return data as T;
}
