'use client'

import Link from 'next/link'
import { ShoppingCart, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format-price'

import { useCart } from '../hooks/use-cart'
import { CartItem } from './cart-item'

export function CartDrawer() {
  const { items, subtotal, isDrawerOpen, closeDrawer, hasHydrated } = useCart()

  if (!isDrawerOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Fermer le panier"
        onClick={closeDrawer}
      />

      <aside
        className="bg-background border-border absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l shadow-xl"
        role="dialog"
        aria-label="Panier"
      >
        <header className="border-border flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-base font-semibold">Mon panier</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeDrawer} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-4">
          {!hasHydrated ? null : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <ShoppingCart className="text-muted-foreground h-10 w-10" />
              <p className="text-sm font-medium">Votre panier est vide</p>
              <p className="text-muted-foreground text-xs">Ajoutez des produits pour commencer.</p>
              <Button asChild className="mt-3" onClick={closeDrawer}>
                <Link href="/produits">Découvrir les produits</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {items.map((item) => (
                <li key={item.productId}>
                  <CartItem item={item} variant="drawer" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasHydrated && items.length > 0 && (
          <footer className="border-border space-y-3 border-t p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="text-base font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <Button asChild size="lg" className="w-full" onClick={closeDrawer}>
              <Link href="/checkout">Passer commande</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full" onClick={closeDrawer}>
              <Link href="/panier">Voir le panier</Link>
            </Button>
          </footer>
        )}
      </aside>
    </div>
  )
}
