import { socialSignInAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

/** GitHub / Google buttons with an "or" divider; renders nothing until a provider's keys are set. */
export function SocialButtons({ providers, next }: { providers: ("github" | "google")[]; next?: string }) {
  if (providers.length === 0) return null;
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {providers.map((provider) => (
          <form key={provider} action={socialSignInAction}>
            <input type="hidden" name="provider" value={provider} />
            {next && <input type="hidden" name="next" value={next} />}
            <Button type="submit" variant="outline" className="w-full">
              Continue with {provider === "github" ? "GitHub" : "Google"}
            </Button>
          </form>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground" role="separator">
        <span className="h-px flex-1 bg-border" />
        or continue with email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
