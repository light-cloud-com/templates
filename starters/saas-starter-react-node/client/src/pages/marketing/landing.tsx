import { Link } from "react-router";
import { CreditCard, KeyRound, LockKeyhole, ShieldCheck, Users, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: LockKeyhole, title: "Accounts that just work", text: "Email and password, password reset, email verification and optional GitHub or Google sign-in." },
  { icon: Users, title: "Teams and roles", text: "Workspaces with owners, admins and members. Invite people by email and switch between teams." },
  { icon: CreditCard, title: "Subscriptions", text: "Stripe Checkout, the Customer Portal and webhooks, driven by one plans file with limits." },
  { icon: KeyRound, title: "API keys", text: "Per-workspace keys, stored hashed and shown once, for a small versioned REST API." },
  { icon: ShieldCheck, title: "Admin panel", text: "Search users and workspaces, see plans and ban accounts, for platform admins only." },
  { icon: Workflow, title: "Ready to change", text: "React, Node.js and PostgreSQL in plain TypeScript. Rename Projects and build your product." },
];

const faqs = [
  { q: "Do I need any API keys to start?", a: "No. Deploy it, open the URL and sign up. Email, billing and social sign-in switch on when you add their keys." },
  { q: "Where do emails go before I set up email?", a: "Into the server log, with the link in it. Invitations can also be copied from the members page." },
  { q: "Who is the admin?", a: "The first person to sign up, and anyone whose email is listed in ADMIN_EMAILS." },
  { q: "Can I use my own domain?", a: "Yes. The app works out its address from each request, or from APP_URL when you set it." },
];

export function Landing() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <p className="text-muted-foreground mb-4 text-sm font-medium">React + Node.js + PostgreSQL</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Launch your SaaS this week, not this quarter
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-balance">
          Sign-up, teams, billing, an admin panel and an API are already built. Start with your product instead of the plumbing.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/sign-up">Get started free</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/pricing">See pricing</Link></Button>
        </div>
      </section>

      <section aria-labelledby="features" className="bg-muted/40 border-y">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 id="features" className="text-center text-3xl font-semibold tracking-tight">Everything a SaaS needs on day one</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon className="text-primary size-6" aria-hidden />
                <h3 className="mt-3 font-medium">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-20">
        <h2 id="faq" className="text-center text-3xl font-semibold tracking-tight">Questions</h2>
        <div className="mt-10 grid gap-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="text-muted-foreground mt-2 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-14 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Start building today</h2>
          <p className="mt-3 opacity-80">Free while you try it. No card needed.</p>
          <Button asChild size="lg" variant="secondary" className="mt-8"><Link to="/sign-up">Create your account</Link></Button>
        </div>
      </section>
    </>
  );
}
