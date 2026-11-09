import { APIError } from "better-auth/api";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { ForbiddenError } from "./permissions";
import { PlanLimitError } from "./plans";

export class RateLimitedError extends Error {
  constructor() {
    super("Too many attempts. Wait a minute and try again.");
  }
}

export type ActionState = { error?: string; ok?: string; secret?: string } | null;

/**
 * Runs a server action body and turns expected failures (validation, permissions, plan limits,
 * Better Auth errors) into a message for the form. redirect() and notFound() pass through.
 */
export async function runAction(fn: () => Promise<ActionState | void>): Promise<ActionState> {
  try {
    return (await fn()) ?? { ok: "Saved." };
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof ZodError) return { error: err.issues[0]?.message ?? "Invalid input." };
    if (err instanceof APIError) return { error: err.body?.message ?? err.message };
    if (err instanceof ForbiddenError || err instanceof PlanLimitError || err instanceof RateLimitedError) return { error: err.message };
    console.error(err);
    return { error: "Something went wrong. Try again." };
  }
}
