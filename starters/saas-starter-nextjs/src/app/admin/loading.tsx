import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}
