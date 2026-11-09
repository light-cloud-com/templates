import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useAppConfig } from "@/lib/queries";

// Shown only for providers whose client id and secret are set on the server.
export function SocialButtons({ next = "/dashboard" }: { next?: string }) {
  const providers = useAppConfig().data?.providers;
  const enabled = (["github", "google"] as const).filter((p) => providers?.[p]);
  if (enabled.length === 0) return null;
  const signIn = (provider: "github" | "google") =>
    authClient.signIn.social({ provider, callbackURL: next, newUserCallbackURL: "/onboarding", errorCallbackURL: "/sign-in" });
  return (
    <div className="grid gap-2">
      {enabled.map((p) => (
        <Button key={p} type="button" variant="outline" onClick={() => signIn(p)}>
          Continue with {p === "github" ? "GitHub" : "Google"}
        </Button>
      ))}
      <div className="text-muted-foreground my-2 flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" /> or <span className="bg-border h-px flex-1" />
      </div>
    </div>
  );
}
