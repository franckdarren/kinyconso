'use client'

import { useTransition } from 'react'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useCart } from '@/features/cart/hooks/use-cart'

interface AddToCartButtonProps {
  productId: string
  productSlug: string
  productName: string
  price: number
  image?: string | null
  stockQuantity: number
  disabled?: boolean
}

export function AddToCartButton({
  productId,
  productSlug,
  productName,
  price,
  image,
  stockQuantity,
  disabled,
}: AddToCartButtonProps) {
  const { addItem, openDrawer, hasHydrated } = useCart()
  const [isPending, startTransition] = useTransition()
  const isOutOfStock = stockQuantity <= 0

  const handleClick = () => {
    startTransition(() => {
      const result = addItem({
        productId,
        slug: productSlug,
        name: productName,
        image: image ?? null,
        unitPrice: price,
        maxStock: stockQuantity,
      })
      if (!result.success) {
        toast.error(result.error ?? 'Erreur')
        return
      }
      toast.success(`${productName} ajouté au panier`)
      openDrawer()
    })
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleClick}
      disabled={disabled || isOutOfStock || isPending || !hasHydrated}
      className="gap-2"
    >
      <ShoppingCart className="h-4 w-4" />
      {isOutOfStock ? 'En rupture' : 'Ajouter au panier'}
    </Button>
  )
}
