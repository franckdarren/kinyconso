'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format-price'

import { useCart } from '../hooks/use-cart'

interface CartSummaryProps {
  /** Affiche le bouton "Passer commande" */
  showCheckoutButton?: boolean
  onCheckoutClick?: () => void
}

export function CartSummary({ showCheckoutButton = true, onCheckoutClick }: CartSummaryProps) {
  const { subtotal, itemCount, hasHydrated } = useCart()
  const safeSubtotal = hasHydrated ? subtotal : 0
  const safeCount = hasHydrated ? itemCount : 0

  return (
    <div className="bg-muted/40 border-border rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Récapitulatif</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Articles ({safeCount})</dt>
          <dd className="font-medium">{formatPrice(safeSubtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Livraison</dt>
          <dd className="text-muted-foreground">Calculée au checkout</dd>
        </div>
        <div className="border-border flex justify-between border-t pt-2 text-base font-semibold">
          <dt>Sous-total</dt>
          <dd>{formatPrice(safeSubtotal)}</dd>
        </div>
      </dl>

      {showCheckoutButton && (
        <Button
          asChild
          className="mt-4 w-full"
          size="lg"
          disabled={safeCount === 0}
          onClick={onCheckoutClick}
        >
          <Link href="/checkout">Passer commande</Link>
        </Button>
      )}
    </div>
  )
}
