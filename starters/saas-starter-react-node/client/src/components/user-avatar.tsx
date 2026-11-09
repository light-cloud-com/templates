import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarColour, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Photo when there is one, else initials on a colour picked from the name. */
export function UserAvatar({ name, seed, image, className, square }: { name: string; seed?: string; image?: string | null; className?: string; square?: boolean }) {
  return (
    <Avatar className={cn("size-8", square && "rounded-md after:rounded-md", className)}>
      {image && <AvatarImage src={image} alt="" className={cn(square && "rounded-md")} />}
      <AvatarFallback className={cn("text-xs font-semibold text-white", square && "rounded-md")} style={{ backgroundColor: avatarColour(seed ?? name) }}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
