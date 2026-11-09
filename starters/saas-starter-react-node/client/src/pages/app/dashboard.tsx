import { useEffect, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, CheckCircle2, Circle, CreditCard, FolderKanban, KeyRound, Plus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, PageSkeleton } from "@/components/states";
import { useActiveOrganization, useSession } from "@/lib/auth-client";
import { timeAgo } from "@/lib/format";
import { useAppConfig, useCan, useWorkspace } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useProjects } from "@/features/projects/use-projects";
import { getPlan } from "@shared/plans.ts";

function greeting(hour = new Date().getHours()) {
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function Meter({ value, limit }: { value: number; limit: number | null }) {
  if (limit === null) return <p className="text-muted-foreground mt-3 text-xs">Unlimited on your plan</p>;
  const pct = Math.min(100, Math.round((value / limit) * 100));
  return (
    <div className="mt-3 grid gap-1.5">
      <div className="bg-muted h-1.5 overflow-hidden rounded-full" role="meter" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={value} aria-label={`${value} of ${limit} used`}>
        <div className={cn("h-full rounded-full", pct >= 100 ? "bg-warning" : "bg-primary")} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-muted-foreground text-xs">{value} of {limit} on your plan</p>
    </div>
  );
}

function Stat({ to, icon: Icon, label, value, children }: { to?: string; icon: typeof Users; label: string; value: ReactNode; children?: ReactNode }) {
  const body = (
    <>
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        {label}
        <Icon className="size-4" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {children}
    </>
  );
  const cls = "bg-card block rounded-xl border p-4 sm:p-5";
  return to
    ? <Link to={to} className={cn(cls, "hover:border-foreground/20 hover:bg-surface transition-colors")}>{body}</Link>
    : <div className={cls}>{body}</div>;
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-card rounded-xl border">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Dashboard() {
  const user = useSession().data?.user;
  const org = useActiveOrganization().data;
  const workspace = useWorkspace();
  const projects = useProjects();
  const billingEnabled = useAppConfig().data?.billingEnabled;
  const canInvite = useCan({ invitation: ["create"] });
  const canKeys = useCan({ apiKey: ["create"] });
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    if (params.get("upgraded")) {
      toast.success("Thanks! Your plan is updating; it can take a few seconds.");
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const title = `${greeting()}${firstName ? `, ${firstName}` : ""}`;

  if (workspace.error) {
    return <><PageHeader title={title} docTitle="Dashboard" /><ErrorState title="Could not load your workspace" error={workspace.error} onRetry={() => void workspace.refetch()} /></>;
  }
  if (!workspace.data) return <PageSkeleton />;

  const ws = workspace.data;
  const plan = getPlan(ws.plan);
  const checklist = [
    { done: true, label: "Create your workspace", to: "/settings/workspace" },
    { done: ws.counts.projects > 0, label: "Create your first project", to: "/projects?new=1" },
    ...(canInvite ? [{ done: ws.counts.members > 1 || ws.counts.invitations > 0, label: "Invite a teammate", to: "/settings/members" }] : []),
    ...(canKeys ? [{ done: ws.counts.apiKeys > 0, label: "Create an API key", to: "/settings/api-keys" }] : []),
    ...(billingEnabled && ws.role === "owner" ? [{ done: ws.plan !== "free", label: "Choose a paid plan", to: "/settings/billing" }] : []),
  ];
  const done = checklist.filter((c) => c.done).length;
  const recent = projects.data?.slice(0, 5);

  return (
    <>
      <PageHeader
        title={title}
        docTitle="Dashboard"
        description={<>{org?.name ?? "Your workspace"} · {plan.name} plan</>}
        action={<Button asChild><Link to="/projects?new=1"><Plus aria-hidden /> New project</Link></Button>}
      />

      <div className="grid grid-cols-1 gap-6">
        {done < checklist.length && (
          <section aria-labelledby="getting-started" className="bg-card rounded-xl border p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="getting-started" className="text-sm font-semibold">Get started</h2>
                <p className="text-muted-foreground mt-0.5 text-sm">{done} of {checklist.length} steps done</p>
              </div>
            </div>
            <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={done}>
              <div className="bg-primary h-full rounded-full transition-[width]" style={{ width: `${(done / checklist.length) * 100}%` }} />
            </div>
            <ul className="mt-4 grid gap-1 sm:grid-cols-2">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link to={c.to} className="hover:bg-muted flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm">
                    {c.done
                      ? <CheckCircle2 className="text-primary-text size-[18px] shrink-0" aria-label="Done" />
                      : <Circle className="text-muted-foreground size-[18px] shrink-0" aria-label="To do" />}
                    <span className={cn("flex-1", c.done && "text-muted-foreground line-through")}>{c.label}</span>
                    {!c.done && <ArrowRight className="text-muted-foreground size-4" aria-hidden />}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat to="/projects" icon={FolderKanban} label="Projects" value={ws.counts.projects}><Meter value={ws.counts.projects} limit={plan.limits.projects} /></Stat>
          <Stat to="/settings/members" icon={Users} label="Members" value={ws.counts.members}><Meter value={ws.counts.members} limit={plan.limits.members} /></Stat>
          <Stat to={canKeys ? "/settings/api-keys" : undefined} icon={KeyRound} label="API keys" value={ws.counts.apiKeys}>
            <p className="text-muted-foreground mt-3 text-xs">{canKeys ? "For the REST API" : "Managed by owners and admins"}</p>
          </Stat>
          <Stat to="/settings/billing" icon={CreditCard} label="Plan" value={plan.name}>
            <p className="text-muted-foreground mt-3 text-xs">{plan.priceMonthly === 0 ? "Free forever" : `$${plan.priceMonthly} per month`}</p>
          </Stat>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel title="Recent projects" action={<Link to="/projects" className="text-primary-text text-[0.8125rem] font-medium hover:underline">View all</Link>}>
              {projects.error ? (
                <ErrorState className="m-4 border-0" title="Could not load projects" error={projects.error} onRetry={() => void projects.refetch()} />
              ) : !recent ? (
                <div className="grid gap-3 p-5"><Skeleton className="h-5" /><Skeleton className="h-5" /><Skeleton className="h-5" /></div>
              ) : recent.length === 0 ? (
                <EmptyState className="m-4 border-0" icon={FolderKanban} title="No projects yet" description="Projects you create show up here."
                  action={<Button asChild size="sm"><Link to="/projects?new=1"><Plus aria-hidden /> New project</Link></Button>} />
              ) : (
                <ul className="divide-y">
                  {recent.map((p) => (
                    <li key={p.id}>
                      <Link to={`/projects/${p.id}`} className="hover:bg-surface flex items-center gap-3 px-4 py-3 sm:px-5">
                        <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md"><FolderKanban className="size-4" aria-hidden /></span>
                        <span className="grid min-w-0 flex-1">
                          <span className="truncate font-medium">{p.name}</span>
                          <span className="text-muted-foreground truncate text-xs">{p.description || "No description"}</span>
                        </span>
                        <span className="text-muted-foreground shrink-0 text-xs">{timeAgo(p.updatedAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
          <Panel title="Quick actions">
            <ul className="grid p-2">
              {[
                { to: "/projects?new=1", icon: Plus, label: "Create a project", show: true },
                { to: "/settings/members", icon: UserPlus, label: "Invite a teammate", show: canInvite },
                { to: "/settings/api-keys", icon: KeyRound, label: "Create an API key", show: canKeys },
                { to: "/settings/billing", icon: CreditCard, label: "View plans and billing", show: true },
              ].filter((a) => a.show).map((a) => (
                <li key={a.label}>
                  <Link to={a.to} className="hover:bg-muted flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium">
                    <a.icon className="text-muted-foreground size-4" aria-hidden /> {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
