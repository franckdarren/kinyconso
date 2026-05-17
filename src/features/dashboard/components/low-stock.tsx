import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { LOW_STOCK_THRESHOLD, type LowStockRow } from '../queries'

interface LowStockProps {
  products: LowStockRow[]
}

export function LowStock({ products }: LowStockProps) {
  return (
    <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold">Stocks faibles</h2>
          <p className="text-muted-foreground text-xs">
            Produits actifs avec ≤ {LOW_STOCK_THRESHOLD} unités
          </p>
        </div>
        <Link
          href="/admin/produits?stock=low"
          className="text-muted-foreground hover:text-foreground text-xs font-medium"
        >
          Voir tout
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="text-muted-foreground mt-3 text-sm">Tous les stocks sont sains.</p>
      ) : (
        <ul className="divide-border mt-3 divide-y">
          {products.map((product) => {
            const isOut = product.stockQuantity === 0
            return (
              <li key={product.id} className="flex items-center gap-3 py-2.5">
                <div className="bg-muted border-border relative h-10 w-10 shrink-0 overflow-hidden rounded border">
                  {product.image && (
                    <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/produits/${product.id}/modifier`}
                    className="line-clamp-1 text-sm font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-muted-foreground text-xs">/{product.slug}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isOut ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" aria-hidden />
                  {isOut
                    ? 'Rupture'
                    : `${product.stockQuantity} restant${product.stockQuantity > 1 ? 's' : ''}`}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
