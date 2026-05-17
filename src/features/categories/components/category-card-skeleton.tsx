import { Skeleton } from '@/components/ui/skeleton'

export function CategoryCardSkeleton() {
  return (
    <div className="bg-card border-border overflow-hidden rounded-lg border shadow-sm">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

interface CategoryGridSkeletonProps {
  count?: number
}

export function CategoryGridSkeleton({ count = 6 }: CategoryGridSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  )
}
