import { z } from "zod";

// Input rules shared by forms and server actions. Each `max` has a matching maxLength on its input.
export const limits = { personName: 100, workspaceName: 80, projectName: 100, projectDescription: 1000, keyName: 60, email: 254, password: 128 } as const;

const tooLong = (what: string, max: number) => `${what} must be ${max} characters or fewer`;

export const personName = z.string().trim().min(1, "Enter your name").max(limits.personName, tooLong("Name", limits.personName));
export const workspaceName = z.string().trim().min(1, "Name your workspace").max(limits.workspaceName, tooLong("Workspace name", limits.workspaceName));
export const email = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .max(limits.email, tooLong("Email", limits.email))
  .pipe(z.email("Enter a valid email address, like name@example.com"))
  .transform((e) => e.toLowerCase());
export const newPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(limits.password, tooLong("Password", limits.password));

/** Parses a form's fields with `shape`; errors come back keyed by field name. */
export function parseForm<T extends z.ZodRawShape>(form: FormData, shape: T) {
  const values = Object.fromEntries(Object.keys(shape).map((k) => [k, form.get(k) ?? ""]));
  return z.object(shape).parse(values);
}
