import { CheckCircle2, Circle, CreditCard, FolderKanban, KeyRound, LayoutDashboard, Settings, Users } from "lucide-react";

const projects = [
  { name: "Website relaunch", note: "Marketing site and docs", when: "2 hours ago" },
  { name: "Mobile app", note: "iOS and Android beta", when: "yesterday" },
  { name: "Billing migration", note: "Move plans to yearly", when: "3 days ago" },
];

/** A static drawing of the real dashboard for the landing page. Decorative: screen readers get one label. */
export function DashboardMock() {
  return (
    <div role="img" aria-label="The app's dashboard: a sidebar, a getting-started checklist, usage cards and recent projects"
      className="bg-card overflow-hidden rounded-2xl border text-left text-[13px] select-none">
      <div className="bg-surface flex h-9 items-center gap-2 border-b px-3" aria-hidden>
        <span className="bg-border size-2.5 rounded-full" /><span className="bg-border size-2.5 rounded-full" /><span className="bg-border size-2.5 rounded-full" />
        <span className="bg-background text-muted-foreground mx-auto rounded-md border px-3 py-0.5 text-[11px]">app.acme.com/dashboard</span>
      </div>
      <div className="flex" aria-hidden>
        <div className="bg-surface hidden w-48 shrink-0 border-r p-3 sm:block">
          <div className="flex items-center gap-2 px-1 font-semibold"><span className="bg-primary size-5 rounded-md" /> Acme</div>
          <div className="bg-background mt-3 flex items-center gap-2 rounded-md border p-1.5">
            <span className="size-5 rounded bg-[#0e7490]" /><span className="grid leading-tight"><span className="font-medium">Northwind</span><span className="text-muted-foreground text-[11px]">Pro plan</span></span>
          </div>
          <div className="mt-3 grid gap-0.5">
            {[[LayoutDashboard, "Dashboard", true], [FolderKanban, "Projects"], [Settings, "Settings"]].map(([Icon, label, active]) => {
              const I = Icon as typeof Settings;
              return <span key={label as string} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${active ? "bg-primary/10 text-primary-text font-medium" : "text-muted-foreground"}`}><I className="size-3.5" />{label as string}</span>;
            })}
          </div>
        </div>
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <p className="text-base font-semibold tracking-tight">Good morning, Ada</p>
          <p className="text-muted-foreground text-xs">Northwind · Pro plan</p>
          <div className="mt-4 rounded-lg border p-3">
            <div className="flex justify-between text-xs"><span className="font-semibold">Get started</span><span className="text-muted-foreground">3 of 4 done</span></div>
            <div className="bg-muted mt-2 h-1 rounded-full"><div className="bg-primary h-1 w-3/4 rounded-full" /></div>
            <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
              <span className="text-muted-foreground flex items-center gap-1.5 line-through"><CheckCircle2 className="text-primary-text size-3.5" />Create your first project</span>
              <span className="flex items-center gap-1.5"><Circle className="text-muted-foreground size-3.5" />Create an API key</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[[FolderKanban, "Projects", "12", 24], [Users, "Members", "6", 60], [KeyRound, "API keys", "2", 0], [CreditCard, "Plan", "Pro", 0]].map(([Icon, label, value, pct]) => {
              const I = Icon as typeof Users;
              return (
                <div key={label as string} className="rounded-lg border p-2.5">
                  <div className="text-muted-foreground flex items-center justify-between text-[11px]">{label as string}<I className="size-3" /></div>
                  <div className="mt-1 text-base font-semibold">{value as string}</div>
                  {(pct as number) > 0 && <div className="bg-muted mt-1.5 h-1 rounded-full"><div className="bg-primary h-1 rounded-full" style={{ width: `${pct}%` }} /></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg border">
            <div className="border-b px-3 py-2 text-xs font-semibold">Recent projects</div>
            {projects.map((p) => (
              <div key={p.name} className="flex items-center gap-2 border-b px-3 py-2 last:border-0">
                <span className="bg-muted size-6 shrink-0 rounded" />
                <span className="grid min-w-0 flex-1 leading-tight"><span className="truncate font-medium">{p.name}</span><span className="text-muted-foreground truncate text-[11px]">{p.note}</span></span>
                <span className="text-muted-foreground shrink-0 text-[11px]">{p.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
