import Image from 'next/image'
import Link from 'next/link'

import { formatPrice } from '@/lib/utils/format-price'

import type { TopProductRow } from '../queries'

interface TopProductsProps {
  products: TopProductRow[]
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold">Top produits</h2>
      <p className="text-muted-foreground mb-3 text-xs">Les plus vendus sur la période</p>

      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm">Aucune vente sur la période.</p>
      ) : (
        <ol className="divide-border divide-y">
          {products.map((product, index) => (
            <li key={product.productId} className="flex items-center gap-3 py-2.5">
              <span className="bg-muted text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {index + 1}
              </span>
              <div className="bg-muted border-border relative h-10 w-10 shrink-0 overflow-hidden rounded border">
                {product.image && (
                  <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {product.slug ? (
                  <Link
                    href={`/produits/${product.slug}`}
                    className="line-clamp-1 text-sm font-medium hover:underline"
                  >
                    {product.productName}
                  </Link>
                ) : (
                  <p className="line-clamp-1 text-sm font-medium">{product.productName}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  {product.quantitySold} vendu{product.quantitySold > 1 ? 's' : ''}
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums">
                {formatPrice(product.revenue)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
