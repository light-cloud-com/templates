import { useTitle } from "@/lib/title";

// Placeholders. Replace them with your own terms and privacy policy before launch.
function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  useTitle(title);
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">Last updated: replace this date.</p>
      <div className="mt-8 grid gap-4 leading-7">{children}</div>
    </article>
  );
}

export function Terms() {
  return (
    <Legal title="Terms of service">
      <p>This is placeholder text. Describe who may use the service, what they may not do with it, how billing and cancellation work, and the limits of your liability.</p>
      <p>Have a lawyer review your terms before you charge customers.</p>
    </Legal>
  );
}

export function Privacy() {
  return (
    <Legal title="Privacy policy">
      <p>This is placeholder text. Explain what personal data you collect (for example name, email address and billing details), why, how long you keep it, who processes it for you (your host, email and payment providers) and how people can ask for it to be deleted.</p>
    </Legal>
  );
}
