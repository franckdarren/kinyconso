import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/format-price'

interface PriceTagProps {
  price: number
  compareAtPrice?: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceTag({ price, compareAtPrice, size = 'md', className }: PriceTagProps) {
  const hasDiscount = compareAtPrice != null && compareAtPrice > price
  const discount = hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0

  const priceClass = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-2xl font-bold',
  }[size]

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn('text-foreground', priceClass)}>{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className="text-muted-foreground text-sm line-through">
            {formatPrice(compareAtPrice)}
          </span>
          <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium">
            -{discount}%
          </span>
        </>
      )}
    </div>
  )
}
