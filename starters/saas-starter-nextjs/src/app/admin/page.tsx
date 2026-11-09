import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { impersonateAction, setBannedAction } from "./actions";

const { user, organization, subscription } = schema;

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const tab = sp.tab === "workspaces" ? "workspaces" : "users";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const me = (await getSession())!.user;

  return (
    <>
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <nav aria-label="Admin sections" className="flex gap-1">
          {(["users", "workspaces"] as const).map((t) => (
            <Button key={t} asChild variant={t === tab ? "secondary" : "ghost"} size="sm">
              <Link href={`/admin?tab=${t}`} aria-current={t === tab ? "page" : undefined}>{t === "users" ? "Users" : "Workspaces"}</Link>
            </Button>
          ))}
        </nav>
        <form className="flex items-end gap-2" role="search">
          <input type="hidden" name="tab" value={tab} />
          <div className="space-y-1">
            <Label htmlFor="q" className="sr-only">Search {tab}</Label>
            <Input id="q" name="q" defaultValue={q} placeholder={tab === "users" ? "Name or email" : "Name or slug"} />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </div>
      {tab === "users" ? <Users like={like} meId={me.id} /> : <Workspaces like={like} />}
    </>
  );
}

async function Users({ like, meId }: { like: string; meId: string }) {
  const rows = await db
    .select({
      id: user.id, name: user.name, email: user.email, role: user.role, banned: user.banned, createdAt: user.createdAt,
      workspaces: sql<number>`(select count(*)::int from "member" m where m.user_id = "user"."id")`,
    })
    .from(user)
    .where(or(ilike(user.name, like), ilike(user.email, like)))
    .orderBy(desc(user.createdAt))
    .limit(100);
  return (
    <Table head={["User", "Role", "Workspaces", "Joined", ""]}>
      {rows.map((u) => (
        <tr key={u.id} className="border-t">
          <td className="p-3"><p className="font-medium">{u.name}</p><p className="text-muted-foreground">{u.email}</p></td>
          <td className="p-3"><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role ?? "user"}</Badge>{u.banned && <Badge variant="destructive" className="ml-1">disabled</Badge>}</td>
          <td className="p-3">{u.workspaces}</td>
          <td className="p-3">{u.createdAt.toLocaleDateString("en")}</td>
          <td className="p-3">
            {u.id !== meId && (
              <div className="flex justify-end gap-2">
                <ActionForm action={setBannedAction} className="space-y-0">
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="ban" value={u.banned ? "0" : "1"} />
                  <SubmitButton size="sm" variant="outline">{u.banned ? "Enable" : "Disable"}</SubmitButton>
                </ActionForm>
                {!u.banned && (
                  <ActionForm action={impersonateAction} className="space-y-0">
                    <input type="hidden" name="userId" value={u.id} />
                    <SubmitButton size="sm" variant="ghost">Sign in as</SubmitButton>
                  </ActionForm>
                )}
              </div>
            )}
          </td>
        </tr>
      ))}
    </Table>
  );
}

async function Workspaces({ like }: { like: string }) {
  const rows = await db
    .select({
      id: organization.id, name: organization.name, slug: organization.slug, createdAt: organization.createdAt,
      plan: subscription.plan, status: subscription.status,
      // Correlated counts written as plain SQL so the inner and outer tables are explicit.
      members: sql<number>`(select count(*)::int from "member" m where m.organization_id = "organization"."id")`,
      projects: sql<number>`(select count(*)::int from "project" p where p.organization_id = "organization"."id")`,
    })
    .from(organization)
    .leftJoin(subscription, and(eq(subscription.referenceId, organization.id), inArray(subscription.status, ["active", "trialing", "past_due"])))
    .where(or(ilike(organization.name, like), ilike(organization.slug, like)))
    .orderBy(desc(organization.createdAt))
    .limit(100);
  return (
    <Table head={["Workspace", "Plan", "Members", "Projects", "Created"]}>
      {rows.map((w) => (
        <tr key={w.id} className="border-t">
          <td className="p-3"><p className="font-medium">{w.name}</p><p className="text-muted-foreground">{w.slug}</p></td>
          <td className="p-3"><Badge variant="secondary">{w.plan ?? "free"}</Badge>{w.status && w.status !== "active" && <span className="ml-1 text-muted-foreground">{w.status}</span>}</td>
          <td className="p-3">{w.members}</td>
          <td className="p-3">{w.projects}</td>
          <td className="p-3">{w.createdAt.toLocaleDateString("en")}</td>
        </tr>
      ))}
    </Table>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>{head.map((h, i) => <th key={i} scope="col" className={cn("p-3 font-medium", !h && "sr-only")}>{h || "Actions"}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
