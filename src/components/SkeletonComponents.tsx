import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-3 w-full" />
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="rounded-lg border border-border">
        <div className="space-y-2 p-4">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton
              key={`table-skeleton-${String.fromCharCode(97 + i)}`}
              className="h-12 w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`stats-skeleton-${String.fromCharCode(97 + i)}`} />
      ))}
    </div>
  );
}
