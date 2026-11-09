import { and, count, desc, eq } from "drizzle-orm";
import { ArrowRight, Check, CreditCard, FolderKanban, FolderPlus, KeyRound, UserPlus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { UsageBar } from "@/components/usage-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { billingEnabled } from "@/lib/config";
import { db, schema } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import { can } from "@/lib/permissions";
import { getPlan } from "@/lib/plans";
import { requireWorkspace } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const countWhere = async (table: typeof schema.member | typeof schema.apiKey | typeof schema.project, organizationId: string) =>
  (await db.select({ n: count() }).from(table).where(eq(table.organizationId, organizationId)))[0].n;

export default async function DashboardPage() {
  const { user, workspace, plan, role } = await requireWorkspace();
  const manage = can(role, "member:manage");
  const [projects, members, keys, [{ invites }], recent] = await Promise.all([
    countWhere(schema.project, workspace.id),
    countWhere(schema.member, workspace.id),
    countWhere(schema.apiKey, workspace.id),
    db.select({ invites: count() }).from(schema.invitation).where(and(eq(schema.invitation.organizationId, workspace.id), eq(schema.invitation.status, "pending"))),
    db
      .select({ id: schema.project.id, name: schema.project.name, description: schema.project.description, updatedAt: schema.project.updatedAt })
      .from(schema.project)
      .where(eq(schema.project.organizationId, workspace.id))
      .orderBy(desc(schema.project.updatedAt))
      .limit(5),
  ]);
  const current = getPlan(plan);

  // Derived from real data, so it ticks itself off and disappears once everything is done. Steps a
  // role cannot do (inviting, API keys for members) are left out.
  const checklist = [
    { label: "Create your workspace", text: "Done when you signed up.", done: true, href: "/settings/workspace" },
    ...(manage ? [{ label: "Invite a teammate", text: "Work on projects together.", done: members > 1 || invites > 0, href: "/settings/members" }] : []),
    { label: "Create your first project", text: "Projects are the example resource.", done: projects > 0, href: "/projects?new=1" },
    ...(manage ? [{ label: "Create an API key", text: "Script against the REST API.", done: keys > 0, href: "/settings/api-keys" }] : []),
    ...(billingEnabled && can(role, "billing:manage") ? [{ label: "Choose a plan", text: "Upgrade when you need more room.", done: plan !== "free", href: "/settings/billing" }] : []),
  ];
  const done = checklist.filter((i) => i.done).length;

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} description={`Here is what is happening in ${workspace.name}.`}>
        <Button asChild>
          <Link href="/projects?new=1"><FolderPlus aria-hidden /> New project</Link>
        </Button>
      </PageHeader>

      {done < checklist.length && (
        <Card className="gap-0 overflow-hidden pb-0 sm:gap-0 sm:pb-0">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle><h2>Get started</h2></CardTitle>
            <CardDescription>{done} of {checklist.length} done</CardDescription>
            <div role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={done} className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((done / checklist.length) * 100)}%` }} />
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-0">
            <ul className="divide-y border-t">
              {checklist.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-surface focus-visible:bg-surface focus-visible:outline-none sm:px-6"
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        item.done ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {item.done && <Check className="size-3" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block font-medium", item.done && "text-muted-foreground line-through")}>{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.text}</span>
                    </span>
                    <span className="sr-only">{item.done ? "(done)" : "(to do)"}</span>
                    {!item.done && <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground" aria-hidden />}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section aria-label="Usage" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat href="/projects" icon={FolderKanban} label="Projects" value={projects}>
          <UsageBar used={projects} limit={current.limits.projects} label="Plan limit" />
        </Stat>
        <Stat href="/settings/members" icon={Users} label="Members" value={members}>
          <UsageBar used={members} limit={current.limits.members} label="Seats" />
        </Stat>
        <Stat href={manage ? "/settings/api-keys" : undefined} icon={KeyRound} label="API keys" value={keys}>
          <p className="text-xs text-muted-foreground">{manage ? (keys ? "Manage keys" : "Create your first key") : "Owners and admins manage keys"}</p>
        </Stat>
        <Stat href="/settings/billing" icon={CreditCard} label="Plan" value={current.name}>
          <p className="text-xs text-muted-foreground">{current.priceMonthly ? `$${current.priceMonthly} a month` : "Free forever"}</p>
        </Stat>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className={cn("lg:col-span-2", recent.length > 0 && "overflow-hidden pb-0 sm:pb-0")}>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle><h2>Recent projects</h2></CardTitle>
            {recent.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/projects">View all <ArrowRight aria-hidden /></Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className={recent.length ? "px-0 sm:px-0" : undefined}>
            {recent.length === 0 ? (
              <EmptyState icon={FolderKanban} title="No projects yet" description="Create a project here, or through the REST API." className="border-dashed">
                <Button asChild size="sm">
                  <Link href="/projects?new=1">New project</Link>
                </Button>
              </EmptyState>
            ) : (
              <ul className="divide-y border-t">
                {recent.map((p) => (
                  <li key={p.id}>
                    <Link href={`/projects/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface focus-visible:bg-surface focus-visible:outline-none sm:px-6">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-surface">
                        <FolderKanban className="size-4 text-muted-foreground" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{p.description || "No description"}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(p.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><h2>Quick actions</h2></CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <QuickAction href="/projects?new=1" icon={FolderPlus} label="New project" />
            {manage && <QuickAction href="/settings/members" icon={UserPlus} label="Invite a teammate" />}
            {manage && <QuickAction href="/settings/api-keys" icon={KeyRound} label="Create an API key" />}
            <QuickAction href="/settings/billing" icon={CreditCard} label="View plan and billing" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ href, icon: Icon, label, value, children }: { href?: string; icon: typeof Users; label: string; value: number | string; children: React.ReactNode }) {
  const body = (
    <>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm font-medium">{label}</span>
        <Icon className="size-4" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-3">{children}</div>
    </>
  );
  const cls = "block rounded-lg border bg-card p-4 sm:p-5";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-foreground/20 hover:bg-surface focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof Users; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 font-medium hover:bg-surface focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      <span className="flex-1">{label}</span>
      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  );
}
