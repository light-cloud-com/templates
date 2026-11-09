"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// React 19 logs "Encountered a script tag" when it renders next-themes' inline script on the client
// (it does after a notFound() in a nested layout). The script only matters in the server HTML, so on
// the client it is marked as a data block; suppressHydrationWarning on it hides the attribute change.
const scriptProps = { type: typeof window === "undefined" ? "text/javascript" : "application/json" };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}
