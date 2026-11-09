import { ArrowRight, CreditCard, KeyRound, Mail, Rocket, Shield, UserPlus, Users, Wrench, Zap } from "lucide-react";
import Link from "next/link";
import { DashboardMock } from "@/components/dashboard-mock";
import { PricingGrid } from "@/components/pricing-grid";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";
import { getPlan } from "@/lib/plans";
import { getSession, isPlatformAdmin } from "@/lib/session";

const features = [
  { icon: Shield, title: "Accounts that just work", text: "Email and password, password reset, email verification, and GitHub or Google sign-in when you add their keys." },
  { icon: Users, title: "Teams and roles", text: "Workspaces with owners, admins and members. Invite people by email or link and switch between workspaces." },
  { icon: CreditCard, title: "Subscriptions", text: "Stripe Checkout, the customer portal and webhooks, driven by one plans file. Off until you add keys." },
  { icon: KeyRound, title: "API keys and a REST API", text: "Per-workspace keys, stored hashed, for a versioned API your customers can script against." },
  { icon: Mail, title: "Transactional email", text: "Verification, reset, invite and welcome emails through Resend, or printed to the log until you set it up." },
  { icon: Zap, title: "Admin panel", text: "Search users and workspaces, see plans, disable accounts, and sign in as a user to debug." },
];

const steps = [
  { icon: Rocket, title: "Deploy", text: "One click on Light Cloud creates the app and its PostgreSQL database. No keys needed." },
  { icon: UserPlus, title: "Sign up", text: "The first account is the admin. Name a workspace and invite your team." },
  { icon: Wrench, title: "Build your part", text: "Rename the Projects example to your own resource. Pages, API and limits follow the same pattern." },
];

const faqs = [
  { q: "Do I need any API keys to start?", a: "No. Deploy it, open the URL and sign up. Email, billing and social sign-in switch on when you add their keys." },
  { q: "Where is my data stored?", a: "In your own PostgreSQL database. Sessions, workspaces, projects and keys are all regular tables you can query." },
  { q: "Can I change the plans?", a: "Yes. Plans, prices and limits live in one file, src/lib/plans.ts, and the pricing page and limits read from it." },
  { q: "Who is the admin?", a: "The first person to sign up, plus anyone whose email is listed in ADMIN_EMAILS." },
  { q: "Can my customers use the API?", a: "Yes. Owners and admins create workspace API keys in Settings and call /api/v1 with them." },
];

export default async function LandingPage() {
  const session = await getSession();
  const free = getPlan("free");
  return (
    <>
      <section className="border-b">
        <div className="mx-auto max-w-[1200px] px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden /> Next.js, PostgreSQL and Stripe
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Launch your SaaS this week, not this quarter
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">
            {config.appName} gives you sign-up, teams, billing, an admin panel and an API. Build the part that is yours.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={session ? "/dashboard" : "/sign-up"}>{session ? "Open dashboard" : "Get started free"} <ArrowRight aria-hidden /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Free for up to {free.limits.projects} projects. No card needed.</p>
          <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
            <DashboardMock appName={config.appName} />
          </div>
        </div>
      </section>

      <section id="features" aria-labelledby="features-title" className="scroll-mt-16 border-b bg-surface">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionTitle id="features-title" eyebrow="Features" title="Everything a SaaS needs on day one" text="The parts every product rebuilds, done once and wired together." />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="bg-background p-6">
                <span className="flex size-9 items-center justify-center rounded-lg border bg-surface">
                  <Icon className="size-4 text-link" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="how-title" className="border-b">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionTitle id="how-title" eyebrow="How it works" title="From zero to signed-up users in minutes" />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-lg border p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="pricing-title" className="border-b bg-surface">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionTitle id="pricing-title" eyebrow="Pricing" title="Start free, upgrade when your team grows" />
          <div className="mt-12">
            <PricingGrid signedIn={Boolean(session)} admin={session ? isPlatformAdmin(session.user) : false} />
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 border-b">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionTitle id="faq-title" eyebrow="FAQ" title="Questions and answers" />
          <Accordion type="single" collapsible className="mt-10 rounded-lg border px-5">
            {faqs.map(({ q, a }) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section aria-labelledby="cta-title">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-primary/30 bg-primary/5 p-8 sm:p-12 md:flex-row md:items-center">
            <div>
              <h2 id="cta-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready when you are</h2>
              <p className="mt-2 text-muted-foreground">Free for up to {free.limits.projects} projects. No card needed.</p>
            </div>
            <Button asChild size="lg">
              <Link href={session ? "/dashboard" : "/sign-up"}>{session ? "Open dashboard" : "Create your account"} <ArrowRight aria-hidden /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ id, eyebrow, title, text }: { id: string; eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium text-link">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  );
}
