import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { LogIn, Search, UserCheck, UserX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { type RowAction, RowActions } from "@/components/confirm-action";
import { CardList, CardListItem } from "@/components/data-list";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, schema } from "@/lib/db";
import { formatDate, formatRole } from "@/lib/format";
import { getSession, isPlatformAdmin } from "@/lib/session";
import { impersonateAction, setBannedAction } from "./actions";

const { user, organization, subscription } = schema;
const PAGE_SIZE = 50;

// Non-admins get the not-found title as well as the not-found page.
export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession();
  if (!session || !isPlatformAdmin(session.user)) notFound();
  return { title: "Admin", robots: { index: false } };
}

type Query = { tab: "users" | "workspaces"; q: string; page: number };

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const query: Query = {
    tab: sp.tab === "workspaces" ? "workspaces" : "users",
    q: typeof sp.q === "string" ? sp.q.trim() : "",
    page: Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1),
  };
  const like = `%${query.q.replace(/[%_\\]/g, "\\$&")}%`;
  const me = (await getSession())!.user;

  return (
    <>
      <PageHeader title="Admin" description="Every user and workspace on this installation." />
      <div className="flex flex-col gap-3 border-b sm:flex-row sm:items-end sm:justify-between">
        <nav aria-label="Admin sections" className="flex gap-6">
          {(["users", "workspaces"] as const).map((t) => (
            <Link
              key={t}
              href={`/admin?tab=${t}`}
              aria-current={t === query.tab ? "page" : undefined}
              className="relative flex h-10 items-center px-1 font-medium text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:-bottom-px aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-primary"
            >
              {t === "users" ? "Users" : "Workspaces"}
            </Link>
          ))}
        </nav>
        <form role="search" className="flex gap-2 pb-3">
          <input type="hidden" name="tab" value={query.tab} />
          <Label htmlFor="q" className="sr-only">Search {query.tab}</Label>
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="q" name="q" defaultValue={query.q} placeholder={query.tab === "users" ? "Name or email" : "Name or slug"} className="pl-8" />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
      </div>
      {query.tab === "users" ? <Users like={like} meId={me.id} query={query} /> : <Workspaces like={like} query={query} />}
    </>
  );
}

function Pager({ query, total }: { query: Query; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (query.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, query.page * PAGE_SIZE);
  const href = (page: number) => `/admin?${new URLSearchParams({ tab: query.tab, ...(query.q && { q: query.q }), page: String(page) })}`;
  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-2 text-muted-foreground">
      <p>{total === 0 ? "No results" : `${from}–${to} of ${total}`}</p>
      <div className="flex gap-2">
        {query.page > 1 ? (
          <Button asChild variant="outline" size="sm"><Link href={href(query.page - 1)}>Previous</Link></Button>
        ) : (
          <Button variant="outline" size="sm" disabled>Previous</Button>
        )}
        {query.page < pages ? (
          <Button asChild variant="outline" size="sm"><Link href={href(query.page + 1)}>Next</Link></Button>
        ) : (
          <Button variant="outline" size="sm" disabled>Next</Button>
        )}
      </div>
    </nav>
  );
}

async function Users({ like, meId, query }: { like: string; meId: string; query: Query }) {
  const where = or(ilike(user.name, like), ilike(user.email, like));
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: user.id, name: user.name, email: user.email, role: user.role, banned: user.banned, createdAt: user.createdAt,
        workspaces: sql<number>`(select count(*)::int from "member" m where m.user_id = "user"."id")`,
      })
      .from(user)
      .where(where)
      .orderBy(desc(user.createdAt))
      .limit(PAGE_SIZE)
      .offset((query.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(user).where(where),
  ]);

  const actions = (u: (typeof rows)[number]): RowAction[] =>
    u.id === meId
      ? []
      : [
          ...(!u.banned
            ? [{
                label: "Sign in as",
                icon: <LogIn aria-hidden />,
                confirm: {
                  action: impersonateAction,
                  fields: { userId: u.id },
                  title: `Sign in as ${u.name}?`,
                  description: "You will see the app exactly as they do until you stop impersonating. The session lasts at most an hour.",
                  confirmLabel: "Sign in as user",
                  destructive: false,
                },
              }]
            : []),
          u.banned
            ? {
                label: "Enable user",
                icon: <UserCheck aria-hidden />,
                confirm: { action: setBannedAction, fields: { userId: u.id, ban: "0" }, title: `Enable ${u.name}?`, description: "They can sign in again.", confirmLabel: "Enable user", destructive: false },
              }
            : {
                label: "Disable user",
                icon: <UserX aria-hidden />,
                destructive: true,
                confirm: {
                  action: setBannedAction,
                  fields: { userId: u.id, ban: "1" },
                  title: `Disable ${u.name}?`,
                  description: "They are signed out everywhere and cannot sign in until you enable them again. Their data stays.",
                  confirmLabel: "Disable user",
                },
              },
        ];
  const badges = (u: (typeof rows)[number]) => (
    <span className="flex flex-wrap gap-1">
      <Badge variant={u.role === "admin" ? "default" : "secondary"}>{formatRole(u.role ?? "user")}</Badge>
      {u.banned && <Badge variant="destructive">Disabled</Badge>}
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Workspaces</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} seed={u.email} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name}{u.id === meId && <span className="font-normal text-muted-foreground"> (you)</span>}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{badges(u)}</TableCell>
                <TableCell className="text-muted-foreground">{u.workspaces}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                <TableCell className="text-right"><RowActions label={`Actions for ${u.name}`} actions={actions(u)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CardList label="Users">
        {rows.map((u) => (
          <CardListItem key={u.id} actions={<RowActions label={`Actions for ${u.name}`} actions={actions(u)} />}>
            <div className="flex items-center gap-3">
              <Avatar name={u.name} seed={u.email} />
              <div className="min-w-0">
                <p className="truncate font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {badges(u)} <span>{u.workspaces} workspaces · joined {formatDate(u.createdAt)}</span>
            </div>
          </CardListItem>
        ))}
      </CardList>
      <Pager query={query} total={total} />
    </div>
  );
}

async function Workspaces({ like, query }: { like: string; query: Query }) {
  const where = or(ilike(organization.name, like), ilike(organization.slug, like));
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: organization.id, name: organization.name, slug: organization.slug, createdAt: organization.createdAt,
        plan: subscription.plan, status: subscription.status,
        // Correlated counts written as plain SQL so the inner and outer tables are explicit.
        members: sql<number>`(select count(*)::int from "member" m where m.organization_id = "organization"."id")`,
        projects: sql<number>`(select count(*)::int from "project" p where p.organization_id = "organization"."id")`,
      })
      .from(organization)
      .leftJoin(subscription, and(eq(subscription.referenceId, organization.id), inArray(subscription.status, ["active", "trialing", "past_due"])))
      .where(where)
      .orderBy(desc(organization.createdAt))
      .limit(PAGE_SIZE)
      .offset((query.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(organization).where(where),
  ]);
  const plan = (w: (typeof rows)[number]) => (
    <span className="flex flex-wrap items-center gap-1">
      <Badge variant={w.plan ? "default" : "secondary"}>{formatRole(w.plan ?? "free")}</Badge>
      {w.status && w.status !== "active" && <Badge variant="warning">{w.status.replace("_", " ")}</Badge>}
    </span>
  );
  return (
    <div className="space-y-4">
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Workspace</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Created</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {rows.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <p className="font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.slug}</p>
                </TableCell>
                <TableCell>{plan(w)}</TableCell>
                <TableCell className="text-muted-foreground">{w.members}</TableCell>
                <TableCell className="text-muted-foreground">{w.projects}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(w.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CardList label="Workspaces">
        {rows.map((w) => (
          <CardListItem key={w.id}>
            <p className="font-medium">{w.name}</p>
            <p className="text-xs text-muted-foreground">{w.slug}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {plan(w)} <span>{w.members} members · {w.projects} projects · {formatDate(w.createdAt)}</span>
            </div>
          </CardListItem>
        ))}
      </CardList>
      <Pager query={query} total={total} />
    </div>
  );
}
