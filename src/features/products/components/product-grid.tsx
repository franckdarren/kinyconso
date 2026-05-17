import { cn } from '@/lib/utils/cn'

import { ProductCard } from './product-card'

interface ProductGridProps {
  products: React.ComponentProps<typeof ProductCard>['product'][]
  className?: string
  emptyLabel?: string
  prioritizeFirst?: boolean
}

export function ProductGrid({
  products,
  className,
  emptyLabel = 'Aucun produit ne correspond à votre recherche.',
  prioritizeFirst = false,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4', className)}>
      {products.map((product, idx) => (
        <ProductCard key={product.slug} product={product} priority={prioritizeFirst && idx < 2} />
      ))}
    </div>
  )
}
