import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Every Better Auth endpoint: sign-in, sign-up, OAuth callbacks, workspaces, Stripe webhook (/api/auth/stripe/webhook).
export const { GET, POST } = toNextJsHandler(auth);
