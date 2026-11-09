import { desc, eq } from "drizzle-orm";
import { KeyRound, Lock, Trash2 } from "lucide-react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { type RowAction, RowActions } from "@/components/confirm-action";
import { CodeBlock } from "@/components/copy-button";
import { CardList, CardListItem } from "@/components/data-list";
import { EmptyState } from "@/components/empty-state";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, schema } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/format";
import { can } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { baseUrl } from "@/lib/url";
import { limits } from "@/lib/validation";
import { createApiKeyAction, revokeApiKeyAction } from "./actions";

export const metadata: Metadata = { title: "API keys" };

export default async function ApiKeysPage() {
  const { workspace, role } = await requireWorkspace();
  if (!can(role, "apiKey:manage")) {
    return <EmptyState icon={Lock} title="API keys are for owners and admins" description={`Ask an owner or admin of ${workspace.name} if you need a key.`} />;
  }
  const keys = await db
    .select({ id: schema.apiKey.id, name: schema.apiKey.name, start: schema.apiKey.start, createdAt: schema.apiKey.createdAt, lastUsedAt: schema.apiKey.lastUsedAt })
    .from(schema.apiKey)
    .where(eq(schema.apiKey.organizationId, workspace.id))
    .orderBy(desc(schema.apiKey.createdAt));
  const origin = baseUrl(await headers());
  const revoke = (k: (typeof keys)[number]): RowAction[] => [{
    label: "Revoke key",
    icon: <Trash2 aria-hidden />,
    destructive: true,
    confirm: {
      action: revokeApiKeyAction,
      fields: { id: k.id },
      title: `Revoke ${k.name}?`,
      description: "Requests that use this key start failing with 401 straight away. This cannot be undone.",
      confirmLabel: "Revoke key",
    },
  }];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><h2>Create a key</h2></CardTitle>
          <CardDescription>Keys act on {workspace.name} through the REST API. The key is shown once; only its hash is stored.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={createApiKeyAction} resetOnSuccess className="max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <Field label="Key name" name="name" placeholder="e.g. CI deploys" required maxLength={limits.keyName} />
              </div>
              <SubmitButton className="sm:mt-[22px]">Create key</SubmitButton>
            </div>
          </ActionForm>
        </CardContent>
      </Card>

      {keys.length === 0 ? (
        <EmptyState icon={KeyRound} title="No API keys yet" description="Create a key above to call the API from scripts, CI or another service." />
      ) : (
        <section aria-labelledby="keys-title" className="space-y-3">
          <h2 id="keys-title" className="text-base font-semibold">Keys</h2>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell><code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{k.start}…</code></TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(k.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{k.lastUsedAt ? timeAgo(k.lastUsedAt) : "Never"}</TableCell>
                    <TableCell className="text-right"><RowActions label={`Actions for ${k.name}`} actions={revoke(k)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <CardList label="Keys">
            {keys.map((k) => (
              <CardListItem key={k.id} actions={<RowActions label={`Actions for ${k.name}`} actions={revoke(k)} />}>
                <p className="font-medium">{k.name}</p>
                <code className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{k.start}…</code>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Created {formatDate(k.createdAt)} · {k.lastUsedAt ? `used ${timeAgo(k.lastUsedAt)}` : "never used"}
                </p>
              </CardListItem>
            ))}
          </CardList>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle><h2>Try it</h2></CardTitle>
          <CardDescription>Send the key as a bearer token. Every request acts on {workspace.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code={`curl ${origin}/api/v1/projects \\\n  -H "Authorization: Bearer $API_KEY"`} />
        </CardContent>
      </Card>
    </>
  );
}
