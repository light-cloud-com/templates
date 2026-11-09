import { CreditCard, KeyRound, Mail, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";

const features = [
  { icon: Shield, title: "Accounts that just work", text: "Email and password, password reset, email verification, and GitHub or Google sign-in when you add their keys." },
  { icon: Users, title: "Teams and roles", text: "Workspaces with owners, admins and members. Invite people by email and switch between workspaces." },
  { icon: CreditCard, title: "Subscriptions", text: "Stripe Checkout, the customer portal and webhooks, driven by one plans file. Off until you add keys." },
  { icon: KeyRound, title: "API keys and a REST API", text: "Per-workspace keys, stored hashed, for a versioned API your customers can script against." },
  { icon: Mail, title: "Transactional email", text: "Verification, reset, invite and welcome emails through Resend, or printed to the log until you set it up." },
  { icon: Zap, title: "Admin panel", text: "Search users and workspaces, see plans, disable accounts, and sign in as a user to debug." },
];

const faqs = [
  { q: "Do I need any API keys to start?", a: "No. Deploy it, open the URL and sign up. Email, billing and social sign-in switch on when you add their keys." },
  { q: "Where is my data stored?", a: "In your own PostgreSQL database. Sessions, workspaces, projects and keys are all regular tables you can query." },
  { q: "Can I change the plans?", a: "Yes. Plans, prices and limits live in one file, src/lib/plans.ts, and the pricing page and limits read from it." },
  { q: "Who is the admin?", a: "The first person to sign up, plus anyone whose email is listed in ADMIN_EMAILS." },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Launch your SaaS this week, not this quarter
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          {config.appName} gives you sign-up, teams, billing, an admin panel and an API on Next.js and PostgreSQL. Build the part that is yours.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">Get started free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="features" className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="features" className="text-center text-3xl font-semibold">Everything a SaaS needs on day one</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border bg-card p-6">
                <Icon className="size-6 text-primary" aria-hidden />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-16">
        <h2 id="faq" className="text-center text-3xl font-semibold">Questions</h2>
        <div className="mt-8 divide-y rounded-xl border">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group p-4">
              <summary className="cursor-pointer rounded-sm font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">{q}</summary>
              <p className="mt-2 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl font-semibold">Ready when you are</h2>
          <p className="mt-3 text-muted-foreground">Free for up to 3 projects. No card needed.</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/sign-up">Create your account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
