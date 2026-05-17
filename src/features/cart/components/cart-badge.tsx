'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useCart } from '../hooks/use-cart'

export function CartBadge() {
  const { itemCount, hasHydrated, openDrawer } = useCart()
  const visibleCount = hasHydrated ? itemCount : 0

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      aria-label={`Panier (${visibleCount} article${visibleCount > 1 ? 's' : ''})`}
      onClick={(e) => {
        // Sur desktop on ouvre le drawer ; sur mobile on laisse naviguer vers /panier
        if (window.matchMedia('(min-width: 640px)').matches) {
          e.preventDefault()
          openDrawer()
        }
      }}
      className="relative"
    >
      <Link href="/panier">
        <ShoppingCart className="h-5 w-5" />
        {visibleCount > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold">
            {visibleCount > 99 ? '99+' : visibleCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
