import Link from 'next/link'
import Image from 'next/image'

import { cn } from '@/lib/utils/cn'

import { PriceTag } from './price-tag'

interface ProductCardProps {
  product: {
    slug: string
    name: string
    price: number
    compareAtPrice?: number | null
    images: string[] | null
    stockQuantity?: number
    isFeatured?: boolean
  }
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const image = product.images?.[0]
  const outOfStock = (product.stockQuantity ?? 1) <= 0

  return (
    <Link
      href={`/produits/${product.slug}`}
      className={cn(
        'group bg-card border-border block overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="bg-muted relative aspect-square w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            Aucune image
          </div>
        )}

        {product.isFeatured && (
          <span className="bg-secondary text-secondary-foreground absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium shadow">
            Vedette
          </span>
        )}
        {outOfStock && (
          <span className="bg-background/90 text-foreground absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium shadow">
            Rupture
          </span>
        )}
      </div>

      <div className="space-y-2 p-3">
        <h3 className="text-card-foreground line-clamp-2 text-sm leading-snug font-medium">
          {product.name}
        </h3>
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
      </div>
    </Link>
  )
}
