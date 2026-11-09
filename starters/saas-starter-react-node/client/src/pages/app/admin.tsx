import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { Spinner } from "@/components/spinner";
import { NotFound } from "@/pages/marketing/not-found";
import { api } from "@/lib/api";
import { authClient, unwrap, useSession } from "@/lib/auth-client";

interface AdminUser { id: string; name: string; email: string; role: string | null; banned: boolean | null; emailVerified: boolean; createdAt: string; workspaces: number }
interface AdminWorkspace { id: string; name: string; slug: string; createdAt: string; members: number; plan: string; subscriptionStatus: string | null }

function Search({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return <Input type="search" aria-label={label} placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} className="mb-4 max-w-sm" />;
}

function Users() {
  const me = useSession().data?.user.id;
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery({ queryKey: ["admin", "users", search], queryFn: () => api<AdminUser[]>(`/admin/users?search=${encodeURIComponent(search)}`) });
  const toggleBan = useMutation({
    mutationFn: (u: AdminUser) => unwrap(u.banned ? authClient.admin.unbanUser({ userId: u.id }) : authClient.admin.banUser({ userId: u.id })),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["admin"] }); toast.success("Updated"); },
    onError: (err) => toast.error(err.message),
  });
  return (
    <>
      <Search value={search} onChange={setSearch} label="Search by name or email" />
      {isPending ? <Spinner /> : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Workspaces</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell><div className="font-medium">{u.name}</div><div className="text-muted-foreground text-xs">{u.email}</div></TableCell>
                  <TableCell>{u.workspaces}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-1">
                    {u.role === "admin" && <Badge>Admin</Badge>}
                    {u.banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="secondary">Active</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id !== me && (
                      <Button size="sm" variant={u.banned ? "outline" : "destructive"} onClick={() => toggleBan.mutate(u)}>
                        {u.banned ? "Unban" : "Ban"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function Workspaces() {
  const [search, setSearch] = useState("");
  const { data, isPending } = useQuery({ queryKey: ["admin", "workspaces", search], queryFn: () => api<AdminWorkspace[]>(`/admin/workspaces?search=${encodeURIComponent(search)}`) });
  return (
    <>
      <Search value={search} onChange={setSearch} label="Search by name" />
      {isPending ? <Spinner /> : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Workspace</TableHead><TableHead>Members</TableHead><TableHead>Plan</TableHead><TableHead>Subscription</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.map((w) => (
                <TableRow key={w.id}>
                  <TableCell><div className="font-medium">{w.name}</div><div className="text-muted-foreground text-xs">{w.slug}</div></TableCell>
                  <TableCell>{w.members}</TableCell>
                  <TableCell className="capitalize">{w.plan}</TableCell>
                  <TableCell>{w.subscriptionStatus ?? "None"}</TableCell>
                  <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

export function Admin() {
  const isAdmin = useSession().data?.user.role === "admin";
  if (!isAdmin) return <NotFound />;
  return (
    <>
      <PageHeader title="Admin" description="Everyone on this deployment. Visible to platform admins only." />
      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><Users /></TabsContent>
        <TabsContent value="workspaces"><Workspaces /></TabsContent>
      </Tabs>
    </>
  );
}
