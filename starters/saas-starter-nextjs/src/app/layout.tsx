import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { FlashToast } from "@/components/flash-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { config } from "@/lib/config";
import "./globals.css";

// Self-hosted by Next.js at build time; the CSS falls back to the system font stack.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Rendered per request: pages read runtime env (APP_NAME, which features are on) and the session.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { default: `${config.appName}: the SaaS starter`, template: `%s | ${config.appName}` },
    description: "Accounts, teams, billing and an API, ready to build your product on.",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // next-themes sets the theme class before React hydrates, hence suppressHydrationWarning.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-[3px] focus:ring-ring/50"
        >
          Skip to content
        </a>
        <ThemeProvider>
          {children}
          <Toaster />
          <Suspense>
            <FlashToast />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
