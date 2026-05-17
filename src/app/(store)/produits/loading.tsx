import { Skeleton } from '@/components/ui/skeleton'
import { ProductGridSkeleton } from '@/features/products/components/product-card-skeleton'

export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Skeleton className="mb-1 h-9 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>
      <ProductGridSkeleton count={12} />
    </div>
  )
}
