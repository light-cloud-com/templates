import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of service" };

// Placeholder: replace with terms written for your business before you launch.
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Terms of service</h1>
      <p className="text-muted-foreground">This is a placeholder. Replace it with your own terms before you take real customers.</p>
      <h2 className="pt-6 text-xl font-semibold">Using the service</h2>
      <p>You are responsible for your account and for what you do with it. Keep your password and API keys safe.</p>
      <h2 className="pt-6 text-xl font-semibold">Payments</h2>
      <p>Paid plans renew every month until you cancel. You can cancel at any time from Billing.</p>
      <h2 className="pt-6 text-xl font-semibold">Changes</h2>
      <p>We may update these terms. We will tell you about significant changes by email.</p>
    </article>
  );
}
