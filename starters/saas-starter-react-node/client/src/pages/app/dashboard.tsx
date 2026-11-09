import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { useActiveOrganization, useSession } from "@/lib/auth-client";
import { useAppConfig, useWorkspace } from "@/lib/queries";
import { getPlan } from "@shared/plans.ts";

function Stat({ label, value, limit }: { label: string; value: number; limit: number | null }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">
          {value}
          <span className="text-muted-foreground text-base font-normal"> / {limit ?? "unlimited"}</span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export function Dashboard() {
  const user = useSession().data?.user;
  const org = useActiveOrganization().data;
  const { data: ws } = useWorkspace();
  const billingEnabled = useAppConfig().data?.billingEnabled;
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    if (params.get("upgraded")) {
      toast.success("Thanks! Your plan is updating; it can take a few seconds.");
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  if (!ws) return <Spinner />;
  const plan = getPlan(ws.plan);
  const checklist = [
    { done: true, label: "Create your workspace", to: "/settings/workspace" },
    { done: ws.counts.projects > 0, label: "Create your first project", to: "/projects" },
    { done: ws.counts.members > 1 || ws.counts.invitations > 0, label: "Invite a teammate", to: "/settings/members" },
    { done: ws.counts.apiKeys > 0, label: "Create an API key", to: "/settings/api-keys" },
    ...(billingEnabled ? [{ done: ws.plan !== "free", label: "Choose a paid plan", to: "/settings/billing" }] : []),
  ];
  const remaining = checklist.filter((c) => !c.done).length;

  return (
    <>
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description={org?.name}
        action={<Badge variant="secondary">{plan.name} plan</Badge>}
      />
      {remaining > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle><h2>Getting started</h2></CardTitle>
            <CardDescription>{remaining} of {checklist.length} steps left</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link to={c.to} className="hover:bg-muted flex items-center gap-3 rounded-md p-2 text-sm">
                    {c.done ? <CheckCircle2 className="text-primary size-5" aria-label="Done" /> : <Circle className="text-muted-foreground size-5" aria-label="To do" />}
                    <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Projects" value={ws.counts.projects} limit={plan.limits.projects} />
        <Stat label="Members" value={ws.counts.members} limit={plan.limits.members} />
      </div>
    </>
  );
}
