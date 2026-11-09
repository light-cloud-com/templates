import { socialSignInAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function SocialButtons({ providers, next }: { providers: ("github" | "google")[]; next?: string }) {
  if (providers.length === 0) return null;
  return (
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
      <p className="py-2 text-center text-xs text-muted-foreground">or with email</p>
    </div>
  );
}
