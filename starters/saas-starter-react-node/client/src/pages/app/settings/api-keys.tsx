import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CopyField } from "@/components/copy-button";
import { DataTable } from "@/components/data-table";
import { Field, FormError, SubmitButton } from "@/components/field";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states";
import { authClient, unwrap } from "@/lib/auth-client";
import { formatDate, timeAgo } from "@/lib/format";
import { useActiveWorkspaceId, useCan } from "@/lib/queries";
import { apiKeyInput, LIMITS } from "@shared/schemas.ts";
import { Section } from "./section";

export function ApiKeysSettings() {
  const organizationId = useActiveWorkspaceId() ?? "";
  const canManage = useCan({ apiKey: ["create"] });
  const queryClient = useQueryClient();
  const [created, setCreated] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; form?: string }>({});
  const keys = useQuery({
    queryKey: ["api-keys", organizationId],
    queryFn: () => unwrap(authClient.apiKey.list({ query: { organizationId } })),
    enabled: canManage && !!organizationId,
  });
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["api-keys"] }), queryClient.invalidateQueries({ queryKey: ["workspace"] })]);
  const create = useMutation({
    mutationFn: (name: string) => unwrap(authClient.apiKey.create({ name, organizationId })),
    onSuccess: (key) => { setCreated(key.key); toast.success(`Created ${key.name ?? "the key"}`); void refresh(); },
    onError: (err) => setErrors({ name: err.message }),
  });

  if (!canManage) return <Section title="API keys" description="Only owners and admins can manage API keys. Ask one of them for a key." />;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = apiKeyInput.safeParse({ name: new FormData(form).get("key-name") });
    if (!parsed.success) return setErrors({ name: parsed.error.issues[0]?.message });
    setErrors({});
    create.mutate(parsed.data.name, { onSuccess: () => form.reset() });
  }

  const origin = window.location.origin;
  return (
    <>
      <Section title="Create an API key" description="Keys belong to this workspace and can read and change its projects. Each one is shown once.">
        <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-3">
          <FormError message={errors.form} />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
            <Field label="Key name" id="key-name" placeholder="CI server" maxLength={LIMITS.apiKeyName} required error={errors.name} />
            <SubmitButton pending={create.isPending} className="sm:mt-[1.375rem]">Create key</SubmitButton>
          </div>
        </form>
      </Section>

      <Section title="Keys">
        {keys.error ? <ErrorState title="Could not load API keys" error={keys.error} onRetry={() => void keys.refetch()} />
          : keys.isPending ? <ListSkeleton rows={2} />
          : (
            <DataTable
              label="API keys"
              rows={keys.data.apiKeys}
              rowKey={(k) => k.id}
              name={(k) => k.name ?? "Unnamed key"}
              primary={(k) => <span className="block truncate font-medium">{k.name ?? "Unnamed key"}</span>}
              empty={<EmptyState icon={KeyRound} title="No API keys yet" description="Create one above to call the REST API from scripts and services." />}
              columns={[
                { header: "Name", cell: (k) => <span className="font-medium">{k.name ?? "Unnamed key"}</span>, hideOnCard: true },
                { header: "Key", cell: (k) => <code className="text-muted-foreground font-mono text-xs">{k.start ?? k.prefix}…</code> },
                { header: "Created", cell: (k) => formatDate(k.createdAt) },
                { header: "Last used", cell: (k) => (k.lastRequest ? timeAgo(k.lastRequest) : "Never") },
              ]}
              actions={(k) => [{
                label: "Revoke key", destructive: true,
                onSelect: async () => { await unwrap(authClient.apiKey.delete({ keyId: k.id })); await refresh(); toast.success(`Revoked ${k.name ?? "the key"}`); },
                confirm: { title: `Revoke ${k.name ?? "this key"}?`, description: "Anything using it stops working straight away. This cannot be undone.", action: "Revoke key" },
              }]}
            />
          )}
      </Section>

      <Section title="Use the API" description={<>Send the key as a bearer token. Projects live at <code className="font-mono text-xs">/api/v1/projects</code>.</>}>
        <div className="grid gap-2">
          <CopyField label="Copy the list command" toastMessage="Command copied" value={`curl -H "Authorization: Bearer $KEY" ${origin}/api/v1/projects`} />
          <CopyField label="Copy the create command" toastMessage="Command copied"
            value={`curl -X POST -H "Authorization: Bearer $KEY" -H "content-type: application/json" \\\n  -d '{"name": "Website relaunch"}' ${origin}/api/v1/projects`} />
        </div>
      </Section>

      <Dialog open={!!created} onOpenChange={(o) => !o && setCreated(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy your new key</DialogTitle>
            <DialogDescription>This is the only time it is shown. Store it somewhere safe, such as your CI secrets.</DialogDescription>
          </DialogHeader>
          <CopyField value={created ?? ""} label="Copy key" toastMessage="Key copied" />
          <DialogFooter><Button onClick={() => setCreated(null)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
