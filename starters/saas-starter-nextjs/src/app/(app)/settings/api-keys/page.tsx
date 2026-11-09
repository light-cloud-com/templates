import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { ActionForm, Field, SubmitButton } from "@/components/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db, schema } from "@/lib/db";
import { can } from "@/lib/permissions";
import { requireWorkspace } from "@/lib/session";
import { baseUrl } from "@/lib/url";
import { createApiKeyAction, revokeApiKeyAction } from "./actions";

export const metadata: Metadata = { title: "API keys" };

export default async function ApiKeysPage() {
  const { workspace, role } = await requireWorkspace();
  if (!can(role, "apiKey:manage")) {
    return <p className="text-sm text-muted-foreground">Only owners and admins can manage API keys for {workspace.name}.</p>;
  }
  const keys = await db
    .select({ id: schema.apiKey.id, name: schema.apiKey.name, start: schema.apiKey.start, createdAt: schema.apiKey.createdAt, lastUsedAt: schema.apiKey.lastUsedAt })
    .from(schema.apiKey)
    .where(eq(schema.apiKey.organizationId, workspace.id))
    .orderBy(desc(schema.apiKey.createdAt));
  const origin = baseUrl(await headers());

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><h1>API keys</h1></CardTitle>
          <CardDescription>Keys act on {workspace.name}. Send one as <code>Authorization: Bearer &lt;key&gt;</code>.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionForm action={createApiKeyAction} resetOnSuccess className="space-y-4">
            <Field label="Key name" name="name" placeholder="e.g. CI deploys" required maxLength={60} />
            <SubmitButton>Create key</SubmitButton>
          </ActionForm>
        </CardContent>
      </Card>
      {keys.length > 0 && (
        <ul className="divide-y rounded-xl border">
          {keys.map((k) => (
            <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{k.name}</p>
                <p className="text-sm text-muted-foreground">
                  <code>{k.start}…</code> · created {k.createdAt.toLocaleDateString("en")} · {k.lastUsedAt ? `last used ${k.lastUsedAt.toLocaleDateString("en")}` : "never used"}
                </p>
              </div>
              <ActionForm action={revokeApiKeyAction} className="space-y-0">
                <input type="hidden" name="id" value={k.id} />
                <SubmitButton size="sm" variant="outline" aria-label={`Revoke ${k.name}`}>Revoke</SubmitButton>
              </ActionForm>
            </li>
          ))}
        </ul>
      )}
      <Card>
        <CardHeader><CardTitle><h2>Try it</h2></CardTitle></CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs"><code>{`curl ${origin}/api/v1/projects \\
  -H "Authorization: Bearer $API_KEY"`}</code></pre>
        </CardContent>
      </Card>
    </>
  );
}
