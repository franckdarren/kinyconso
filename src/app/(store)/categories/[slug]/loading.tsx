import { Skeleton } from '@/components/ui/skeleton'
import { ProductGridSkeleton } from '@/features/products/components/product-card-skeleton'

export default function CategoryDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-4 h-4 w-48" />
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  )
}
