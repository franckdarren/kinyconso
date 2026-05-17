'use client'

import Image from 'next/image'

import { formatPrice } from '@/lib/utils/format-price'
import type { CartLine } from '@/stores/cart.store'

interface OrderSummaryProps {
  items: CartLine[]
  subtotal: number
  deliveryFee: number | null
  deliveryLabel?: string | null
  compact?: boolean
}

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  deliveryLabel,
  compact,
}: OrderSummaryProps) {
  const total = subtotal + (deliveryFee ?? 0)

  return (
    <div className="bg-muted/40 border-border rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Récapitulatif</h3>

      {!compact && items.length > 0 && (
        <ul className="divide-border mt-3 max-h-64 divide-y overflow-y-auto">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 py-2">
              <div className="bg-background border-border relative h-12 w-12 shrink-0 overflow-hidden rounded border">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                <p className="text-muted-foreground text-xs">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Sous-total</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Livraison
            {deliveryLabel ? <span className="ml-1 text-xs">({deliveryLabel})</span> : null}
          </dt>
          <dd className="font-medium">
            {deliveryFee === null ? '—' : deliveryFee === 0 ? 'Gratuit' : formatPrice(deliveryFee)}
          </dd>
        </div>
        <div className="border-border flex justify-between border-t pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  )
}
