'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format-price'
import type { CartLine } from '@/stores/cart.store'

import { useCart } from '../hooks/use-cart'

interface CartItemProps {
  item: CartLine
  variant?: 'drawer' | 'page'
  onAfterChange?: () => void
}

export function CartItem({ item, variant = 'drawer', onAfterChange }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const isPage = variant === 'page'

  const handleQty = (next: number) => {
    if (next < 1) {
      removeItem(item.productId)
      onAfterChange?.()
      return
    }
    const result = updateQuantity(item.productId, next)
    if (!result.success) {
      toast.error(result.error ?? 'Erreur')
      return
    }
    onAfterChange?.()
  }

  return (
    <div className="flex gap-3 py-3">
      <Link
        href={`/produits/${item.slug}`}
        className="bg-muted border-border relative h-16 w-16 shrink-0 overflow-hidden rounded-md border"
        aria-hidden={false}
      >
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/produits/${item.slug}`}
            className="hover:text-primary line-clamp-2 text-sm font-medium"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => {
              removeItem(item.productId)
              onAfterChange?.()
            }}
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Retirer du panier"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="text-muted-foreground text-xs">{formatPrice(item.unitPrice)} / unité</p>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="border-border inline-flex items-center rounded-md border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQty(item.quantity - 1)}
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[2ch] px-2 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQty(item.quantity + 1)}
              disabled={item.quantity >= item.maxStock}
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className={isPage ? 'text-base font-semibold' : 'text-sm font-semibold'}>
            {formatPrice(item.unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  )
}
