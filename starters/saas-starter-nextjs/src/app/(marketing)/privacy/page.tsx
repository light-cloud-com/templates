import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy policy" };

// Placeholder: replace with a policy that matches the data you actually collect.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-16">
      <h1 className="text-3xl font-bold">Privacy policy</h1>
      <p className="text-muted-foreground">This is a placeholder. Replace it with your own policy before you launch.</p>
      <h2 className="pt-4 text-xl font-semibold">What we store</h2>
      <p>Your name, email address, a hash of your password, your workspaces and the projects you create.</p>
      <h2 className="pt-4 text-xl font-semibold">Who we share it with</h2>
      <p>Our email provider (to send account emails) and our payment provider (when you subscribe). Nobody else.</p>
      <h2 className="pt-4 text-xl font-semibold">Deleting your data</h2>
      <p>Delete your account from Account settings and your personal data is removed.</p>
    </article>
  );
}
