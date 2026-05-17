'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CartItem } from '@/features/cart/components/cart-item'
import { CartSummary } from '@/features/cart/components/cart-summary'
import { useCart } from '@/features/cart/hooks/use-cart'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

export function CartPageClient() {
  const { items, hasHydrated, clearCart } = useCart()

  if (!hasHydrated) {
    return <LoadingSpinner className="py-16" />
  }

  if (items.length === 0) {
    return (
      <div className="border-border bg-muted/30 flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <ShoppingCart className="text-muted-foreground h-10 w-10" />
        <p className="font-medium">Votre panier est vide</p>
        <p className="text-muted-foreground text-sm">
          Parcourez le catalogue pour ajouter des produits.
        </p>
        <Button asChild className="mt-2">
          <Link href="/produits">Voir les produits</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="bg-card border-border rounded-lg border p-4 shadow-sm">
        <ul className="divide-border divide-y">
          {items.map((item) => (
            <li key={item.productId}>
              <CartItem item={item} variant="page" />
            </li>
          ))}
        </ul>

        <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
          <Button asChild variant="ghost">
            <Link href="/produits">← Continuer les achats</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm('Vider entièrement le panier ?')) clearCart()
            }}
          >
            Vider le panier
          </Button>
        </div>
      </div>

      <aside>
        <CartSummary />
      </aside>
    </div>
  )
}
