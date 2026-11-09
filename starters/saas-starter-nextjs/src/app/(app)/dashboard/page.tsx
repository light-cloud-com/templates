import { and, count, eq } from "drizzle-orm";
import { CheckCircle2, Circle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { billingEnabled } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { countProjects } from "@/lib/projects";
import { requireWorkspace } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

const countWhere = async (table: typeof schema.member | typeof schema.apiKey, organizationId: string) =>
  (await db.select({ n: count() }).from(table).where(eq(table.organizationId, organizationId)))[0].n;

export default async function DashboardPage() {
  const { user, workspace, plan } = await requireWorkspace();
  const [projects, members, keys, [{ invites }]] = await Promise.all([
    countProjects(workspace.id),
    countWhere(schema.member, workspace.id),
    countWhere(schema.apiKey, workspace.id),
    db.select({ invites: count() }).from(schema.invitation).where(and(eq(schema.invitation.organizationId, workspace.id), eq(schema.invitation.status, "pending"))),
  ]);
  const limits = getPlan(plan).limits;

  // Derived from real data, so it ticks itself off and disappears once everything is done.
  const checklist = [
    { label: "Create your workspace", done: true, href: "/settings/workspace" },
    { label: "Invite a teammate", done: members > 1 || invites > 0, href: "/settings/members" },
    { label: "Create your first project", done: projects > 0, href: "/projects" },
    { label: "Create an API key", done: keys > 0, href: "/settings/api-keys" },
    ...(billingEnabled ? [{ label: "Choose a plan", done: plan !== "free", href: "/settings/billing" }] : []),
  ];
  const remaining = checklist.filter((i) => !i.done).length;

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description={`You are in ${workspace.name}.`} />
      {remaining > 0 && (
        <Card>
          <CardHeader>
            <CardTitle><h2>Getting started</h2></CardTitle>
            <CardDescription>{remaining} of {checklist.length} steps left.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  {item.done ? <CheckCircle2 className="size-5 text-primary" aria-label="Done" /> : <Circle className="size-5 text-muted-foreground" aria-label="To do" />}
                  {item.done ? <span className="text-muted-foreground line-through">{item.label}</span> : <Link className="underline-offset-4 hover:underline" href={item.href}>{item.label}</Link>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Projects" value={`${projects} / ${limits.projects ?? "∞"}`} href="/projects" />
        <Stat label="Members" value={`${members} / ${limits.members ?? "∞"}`} href="/settings/members" />
        <Stat label="Plan" value={getPlan(plan).name} href="/settings/billing" />
      </div>
    </>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border bg-card p-6 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Link>
  );
}
