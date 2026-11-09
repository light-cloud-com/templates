import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FormError } from "@/components/field";
import { authClient, unwrap } from "@/lib/auth-client";
import { useActiveWorkspaceId, useCan } from "@/lib/queries";
import { apiKeyInput } from "@shared/schemas.ts";
import { Section } from "./section";

export function ApiKeysSettings() {
  const organizationId = useActiveWorkspaceId() ?? "";
  const canManage = useCan({ apiKey: ["create"] });
  const queryClient = useQueryClient();
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const keys = useQuery({
    queryKey: ["api-keys", organizationId],
    queryFn: () => unwrap(authClient.apiKey.list({ query: { organizationId } })),
    enabled: canManage && !!organizationId,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["api-keys"] }).then(() => queryClient.invalidateQueries({ queryKey: ["workspace"] }));
  const create = useMutation({
    mutationFn: (name: string) => unwrap(authClient.apiKey.create({ name, organizationId })),
    onSuccess: (key) => { setCreated(key.key); void refresh(); },
    onError: (err) => setError(err.message),
  });
  const revoke = useMutation({
    mutationFn: (keyId: string) => unwrap(authClient.apiKey.delete({ keyId })),
    onSuccess: () => { toast.success("Key revoked"); void refresh(); },
    onError: (err) => toast.error(err.message),
  });

  if (!canManage) return <Section title="API keys" description="Only owners and admins can manage API keys." children={null} />;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = apiKeyInput.safeParse({ name: new FormData(form).get("key-name") });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid name");
    setError(null);
    create.mutate(parsed.data.name, { onSuccess: () => form.reset() });
  }

  const list = keys.data?.apiKeys ?? [];
  return (
    <>
      <Section title="Create an API key" description={<>Use it as <code>Authorization: Bearer &lt;key&gt;</code> on <code>/api/v1/projects</code>.</>}>
        <form onSubmit={onSubmit} className="flex max-w-md flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1"><Field label="Name" id="key-name" placeholder="CI server" required /></div>
          <Button type="submit" disabled={create.isPending}>Create key</Button>
          <div className="basis-full"><FormError message={error} /></div>
        </form>
      </Section>
      <Section title="Keys">
        {list.length === 0 ? <p className="text-muted-foreground text-sm">No keys yet.</p> : (
          <ul className="divide-y">
            {list.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span><span className="font-medium">{k.name}</span> <code className="text-muted-foreground ml-2">{k.start}…</code></span>
                <span className="text-muted-foreground flex items-center gap-3 text-xs">
                  {k.lastRequest ? `Last used ${new Date(k.lastRequest).toLocaleDateString()}` : "Never used"}
                  <Button size="sm" variant="ghost" onClick={() => revoke.mutate(k.id)}>Revoke</Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Dialog open={!!created} onOpenChange={(o) => !o && setCreated(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy your new key</DialogTitle>
            <DialogDescription>This is the only time it is shown. Store it somewhere safe.</DialogDescription>
          </DialogHeader>
          <code className="bg-muted rounded-md p-3 text-sm break-all">{created}</code>
          <Button onClick={() => { void navigator.clipboard.writeText(created ?? ""); toast.success("Copied"); }}><Copy aria-hidden /> Copy key</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
