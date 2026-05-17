import { Skeleton } from '@/components/ui/skeleton'
import { CategoryGridSkeleton } from '@/features/categories/components/category-card-skeleton'

export default function CategoriesLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Skeleton className="mb-1 h-9 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
      <CategoryGridSkeleton count={6} />
    </div>
  )
}
