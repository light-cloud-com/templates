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

/**
 * What a form's server action answers. `fieldErrors` maps a field name to its message (shown under the
 * field); `error` is for the form as a whole; `ok` becomes a success toast.
 */
export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: string;
  secret?: string;
  link?: string;
} | null;

// Better Auth error codes worth a friendlier message, and the field they belong to.
const authErrors: Record<string, { field?: string; message: string }> = {
  USER_ALREADY_EXISTS: { field: "email", message: "An account with this email already exists. Sign in instead." },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: { field: "email", message: "An account with this email already exists. Sign in instead." },
  INVALID_EMAIL_OR_PASSWORD: { message: "That email and password don't match. Try again or reset your password." },
  INVALID_PASSWORD: { field: "password", message: "That password isn't right." },
  EMAIL_NOT_VERIFIED: { message: "Confirm your email first: open the link we sent you." },
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: { field: "email", message: "They are already in this workspace." },
  USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: { field: "email", message: "They already have a pending invitation." },
  ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: { message: "Every seat on your plan is taken. Remove someone or upgrade to invite more." },
  INVALID_TOKEN: { message: "This link has expired. Ask for a new one." },
};

/** A thrown error as form state: field errors for validation, a message for everything expected. */
export function toActionState(err: unknown): ActionState {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = String(issue.path[0] ?? "");
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return Object.keys(fieldErrors).length ? { fieldErrors } : { error: err.issues[0]?.message ?? "Check the form and try again." };
  }
  if (err instanceof APIError) {
    const known = authErrors[String(err.body?.code ?? "")];
    if (known) return known.field ? { fieldErrors: { [known.field]: known.message } } : { error: known.message };
    return { error: err.body?.message ?? err.message };
  }
  if (err instanceof ForbiddenError || err instanceof PlanLimitError || err instanceof RateLimitedError) return { error: err.message };
  console.error(err);
  return { error: "Something went wrong. Try again." };
}

/**
 * Runs a server action body and turns expected failures (validation, permissions, plan limits,
 * Better Auth errors) into form state. redirect() and notFound() pass through.
 */
export async function runAction(fn: () => Promise<ActionState | void>): Promise<ActionState> {
  try {
    return (await fn()) ?? { ok: "Saved." };
  } catch (err) {
    unstable_rethrow(err);
    return toActionState(err);
  }
}
