import { useDeferredValue, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Search as SearchIcon, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { UserAvatar } from "@/components/user-avatar";
import { NotFound } from "@/pages/marketing/not-found";
import { api } from "@/lib/api";
import { authClient, unwrap, useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";

interface AdminUser { id: string; name: string; email: string; role: string | null; banned: boolean | null; emailVerified: boolean; createdAt: string; workspaces: number }
interface AdminWorkspace { id: string; name: string; slug: string; createdAt: string; members: number; plan: string; subscriptionStatus: string | null }

function Search({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative mb-4 max-w-sm">
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" aria-hidden />
      <Input type="search" aria-label={label} placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} className="pl-8" maxLength={100} />
    </div>
  );
}

function useAdminList<T>(kind: "users" | "workspaces", search: string) {
  const q = useDeferredValue(search.trim());
  return { q, ...useQuery({ queryKey: ["admin", kind, q], queryFn: () => api<T[]>(`/admin/${kind}?search=${encodeURIComponent(q)}`), placeholderData: keepPreviousData }) };
}

function NoMatch({ q, what }: { q: string; what: string }) {
  return <EmptyState icon={SearchIcon} title={`No ${what} match “${q}”`} description="Check the spelling, or search by part of the name or email." />;
}

function Users() {
  const me = useSession().data?.user.id;
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { q, data, isPending, error, refetch } = useAdminList<AdminUser>("users", search);
  const toggleBan = async (u: AdminUser) => {
    await unwrap(u.banned ? authClient.admin.unbanUser({ userId: u.id }) : authClient.admin.banUser({ userId: u.id }));
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    toast.success(u.banned ? `${u.name || u.email} can sign in again` : `${u.name || u.email} was banned and signed out`);
  };
  return (
    <>
      <Search value={search} onChange={setSearch} label="Search by name or email" />
      {error ? <ErrorState title="Could not load users" error={error} onRetry={() => void refetch()} />
        : isPending ? <ListSkeleton rows={4} />
        : (
          <DataTable
            label="Users"
            rows={data}
            rowKey={(u) => u.id}
            name={(u) => u.name || u.email}
            primary={(u) => <Person name={u.name} email={u.email} id={u.id} />}
            empty={q ? <NoMatch q={q} what="users" /> : <EmptyState icon={UsersIcon} title="No users yet" />}
            columns={[
              { header: "User", cell: (u) => <Person name={u.name} email={u.email} id={u.id} />, hideOnCard: true },
              { header: "Workspaces", cell: (u) => u.workspaces },
              { header: "Joined", cell: (u) => formatDate(u.createdAt) },
              {
                header: "Status",
                cell: (u) => (
                  <span className="inline-flex flex-wrap justify-end gap-1">
                    {u.role === "admin" && <Badge variant="outline">Admin</Badge>}
                    {u.banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="success">Active</Badge>}
                  </span>
                ),
              },
            ]}
            actions={(u) => u.id === me ? [] : [u.banned
              ? { label: "Unban user", onSelect: () => toggleBan(u), confirm: { title: `Unban ${u.name || u.email}?`, description: "They can sign in again.", action: "Unban" } }
              : {
                label: "Ban user", destructive: true, onSelect: () => toggleBan(u),
                confirm: { title: `Ban ${u.name || u.email}?`, description: "They are signed out everywhere and cannot sign in until you unban them.", action: "Ban user" },
              }]}
          />
        )}
    </>
  );
}

function Workspaces() {
  const [search, setSearch] = useState("");
  const { q, data, isPending, error, refetch } = useAdminList<AdminWorkspace>("workspaces", search);
  return (
    <>
      <Search value={search} onChange={setSearch} label="Search by name" />
      {error ? <ErrorState title="Could not load workspaces" error={error} onRetry={() => void refetch()} />
        : isPending ? <ListSkeleton rows={4} />
        : (
          <DataTable
            label="Workspaces"
            rows={data}
            rowKey={(w) => w.id}
            name={(w) => w.name}
            primary={(w) => <Workspace w={w} />}
            empty={q ? <NoMatch q={q} what="workspaces" /> : <EmptyState icon={Building2} title="No workspaces yet" />}
            columns={[
              { header: "Workspace", cell: (w) => <Workspace w={w} />, hideOnCard: true },
              { header: "Members", cell: (w) => w.members },
              { header: "Plan", cell: (w) => <span className="capitalize">{w.plan}</span> },
              { header: "Subscription", cell: (w) => <span className="capitalize">{w.subscriptionStatus ?? "None"}</span> },
              { header: "Created", cell: (w) => formatDate(w.createdAt) },
            ]}
          />
        )}
    </>
  );
}

function Person({ name, email, id }: { name: string; email: string; id: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <UserAvatar name={name || email} seed={id} />
      <span className="grid min-w-0"><span className="truncate font-medium">{name}</span><span className="text-muted-foreground truncate text-xs">{email}</span></span>
    </span>
  );
}

function Workspace({ w }: { w: AdminWorkspace }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <UserAvatar square name={w.name} seed={w.id} />
      <span className="grid min-w-0"><span className="truncate font-medium">{w.name}</span><span className="text-muted-foreground truncate text-xs">{w.slug}</span></span>
    </span>
  );
}

export function Admin() {
  const isAdmin = useSession().data?.user.role === "admin";
  if (!isAdmin) return <NotFound />;
  return (
    <>
      <PageHeader title="Admin" description="Everyone on this deployment. Only platform admins can see this page." />
      <Tabs defaultValue="users">
        <TabsList variant="line" className="mb-4 w-full justify-start border-b">
          <TabsTrigger value="users" className="flex-none px-3">Users</TabsTrigger>
          <TabsTrigger value="workspaces" className="flex-none px-3">Workspaces</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><Users /></TabsContent>
        <TabsContent value="workspaces"><Workspaces /></TabsContent>
      </Tabs>
    </>
  );
}
