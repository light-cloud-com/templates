import { cookies } from "next/headers";

export const FLASH_COOKIE = "flash";

/**
 * A one-time success message that survives a redirect (e.g. "Project deleted" after leaving the deleted
 * project's page). <FlashToast /> shows it as a toast on the next page and clears it.
 */
export async function flash(message: string) {
  (await cookies()).set(FLASH_COOKIE, message, { path: "/", maxAge: 60, sameSite: "lax" });
}
