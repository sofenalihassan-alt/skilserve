import { Skeleton } from "@/components/ui/skeleton";

export const ProviderCardSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
    {/* Header: Avatar + Name + Category */}
    <div className="flex items-start gap-4">
      <Skeleton className="h-14 w-14 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
    {/* Badge pills row */}
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    {/* Bio lines */}
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
    </div>
    {/* Price bar */}
    <Skeleton className="h-5 w-1/3" />
    {/* Action buttons */}
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-9 flex-1 rounded-md" />
      <Skeleton className="h-9 flex-1 rounded-md" />
      <Skeleton className="h-9 flex-1 rounded-md" />
    </div>
  </div>
);

export const MapSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
    <Skeleton className="h-[600px] w-full rounded-none" />
  </div>
);
