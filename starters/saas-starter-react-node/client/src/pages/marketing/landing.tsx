import { Link } from "react-router";
import { ArrowRight, ChevronDown, CreditCard, KeyRound, LockKeyhole, ShieldCheck, Users, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanCards } from "@/components/plan-cards";
import { useTitle } from "@/lib/title";
import { DashboardMock } from "./dashboard-mock";

const features = [
  { icon: LockKeyhole, title: "Accounts that just work", text: "Email and password, password reset, email verification and optional GitHub or Google sign-in." },
  { icon: Users, title: "Teams and roles", text: "Workspaces with owners, admins and members. Invite people by email and switch between teams." },
  { icon: CreditCard, title: "Subscriptions", text: "Stripe Checkout, the customer portal and webhooks, driven by one plans file with limits." },
  { icon: KeyRound, title: "API keys", text: "Per-workspace keys, stored hashed and shown once, for a small versioned REST API." },
  { icon: ShieldCheck, title: "Admin panel", text: "Search users and workspaces, see plans and ban accounts, for platform admins only." },
  { icon: Workflow, title: "Ready to change", text: "React, Node.js and PostgreSQL in plain TypeScript. Rename Projects and build your product." },
];

const steps = [
  { title: "Deploy", text: "One click gives you the app and a PostgreSQL database. No keys needed to start." },
  { title: "Sign up", text: "The first account becomes the platform admin. Create a workspace and invite your team." },
  { title: "Build", text: "Replace the example Projects resource with your product. Push, and it redeploys." },
];

const faqs = [
  { q: "Do I need any API keys to start?", a: "No. Deploy it, open the URL and sign up. Email, billing and social sign-in switch on when you add their keys." },
  { q: "How do invitations work without email?", a: "Every invitation has a link you can copy from the members page and send yourself. Once email is set up, invitations are emailed too." },
  { q: "Who is the admin?", a: "The first person to sign up, and anyone whose email is on the deployment's admin list." },
  { q: "Can I use my own domain?", a: "Yes. The app works out its address from each request, or from a fixed URL once you set one." },
];

export function Landing() {
  useTitle(null);
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
        <p className="bg-surface text-muted-foreground mx-auto mb-6 w-fit rounded-full border px-3 py-1 text-[0.8125rem] font-medium">React · Node.js · PostgreSQL</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Launch your SaaS this week, not this quarter
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-balance">
          Sign-up, teams, billing, an admin panel and an API are already built. Start with your product instead of the plumbing.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/sign-up">Get started free <ArrowRight aria-hidden /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/pricing">See pricing</Link></Button>
        </div>
        <div className="mx-auto mt-14 max-w-5xl sm:mt-16"><DashboardMock /></div>
      </section>

      <section id="features" aria-labelledby="features-title" className="bg-surface border-y">
        <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="features-title" className="text-3xl font-semibold tracking-tight">Everything a SaaS needs on day one</h2>
            <p className="text-muted-foreground mt-3">The boring parts are done, tested and ready to change.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card rounded-xl border p-6">
                <span className="bg-primary/10 text-primary-text flex size-9 items-center justify-center rounded-lg"><Icon className="size-[18px]" aria-hidden /></span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-6">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
        <h2 id="how-title" className="text-center text-3xl font-semibold tracking-tight">From deploy to your product in three steps</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border p-6">
              <span className="border-primary text-primary-text flex size-7 items-center justify-center rounded-full border text-sm font-semibold">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-6">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pricing-title" className="bg-surface border-y">
        <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="pricing-title" className="text-3xl font-semibold tracking-tight">Simple pricing</h2>
            <p className="text-muted-foreground mt-3">Start free. Upgrade a workspace when your team grows.</p>
          </div>
          <div className="mt-12">
            <PlanCards compact action={(plan) => (
              <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                <Link to={plan.priceMonthly === 0 ? "/sign-up" : `/sign-up?plan=${plan.id}`}>{plan.priceMonthly === 0 ? "Start free" : `Choose ${plan.name}`}</Link>
              </Button>
            )} />
          </div>
          <p className="mt-6 text-center text-sm"><Link to="/pricing" className="text-primary-text font-medium hover:underline">Compare every feature</Link></p>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 id="faq-title" className="text-center text-3xl font-semibold tracking-tight">Questions</h2>
        <div className="mt-10 divide-y rounded-xl border">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="hover:bg-surface flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="text-muted-foreground px-5 pb-5 text-sm leading-6">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="cta-title" className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6">
        <div className="bg-primary text-primary-foreground rounded-2xl px-6 py-14 text-center">
          <h2 id="cta-title" className="text-3xl font-semibold tracking-tight">Start building today</h2>
          <p className="mt-3 text-white/80">Free while you try it. No card needed.</p>
          <Button asChild size="lg" className="text-primary mt-8 bg-white hover:bg-white/90"><Link to="/sign-up">Create your account</Link></Button>
        </div>
      </section>
    </>
  );
}
