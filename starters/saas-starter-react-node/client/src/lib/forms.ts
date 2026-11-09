import type { ZodError } from "zod";

export type FieldErrors = Record<string, string | undefined>;

/** The first message for each field of a failed zod parse, keyed by field name. */
export function fieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
