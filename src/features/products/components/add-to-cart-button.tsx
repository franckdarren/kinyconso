'use client'

import { useTransition } from 'react'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface AddToCartButtonProps {
  productId: string
  productName: string
  price: number
  image?: string
  stockQuantity: number
  disabled?: boolean
}

/**
 * Bouton "Ajouter au panier". La logique du store sera branchée en Phase 8.
 * Pour l'instant, affiche simplement un toast de confirmation.
 */
export function AddToCartButton({
  productId,
  productName,
  stockQuantity,
  disabled,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const isOutOfStock = stockQuantity <= 0

  const handleClick = () => {
    startTransition(() => {
      // TODO Phase 8 — useCart().addItem({ productId, productName, price, image, quantity: 1 })
      void productId
      toast.success(`${productName} ajouté au panier (à brancher Phase 8)`)
    })
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleClick}
      disabled={disabled || isOutOfStock || isPending}
      className="gap-2"
    >
      <ShoppingCart className="h-4 w-4" />
      {isOutOfStock ? 'En rupture' : 'Ajouter au panier'}
    </Button>
  )
}
