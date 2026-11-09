"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/** Shows the message a server action left with flash() before redirecting, once. */
export function FlashToast() {
  // Runs after every navigation (path or query), which is when a redirect lands.
  const location = `${usePathname()}?${useSearchParams()}`;
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)flash=([^;]*)/);
    if (!match) return;
    document.cookie = "flash=; path=/; max-age=0";
    toast.success(decodeURIComponent(match[1]));
  }, [location]);
  return null;
}
