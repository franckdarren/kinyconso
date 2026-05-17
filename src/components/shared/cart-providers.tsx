'use client'

import { CartDrawer } from '@/features/cart/components/cart-drawer'
import { useCartRevalidation } from '@/features/cart/hooks/use-cart-revalidation'

/**
 * Composants client globaux liés au panier — monté une seule fois dans le root layout.
 * - CartDrawer : slide-over du panier (contrôlé par le store)
 * - useCartRevalidation : revalide les prix/stocks périodiquement
 */
export function CartProviders() {
  useCartRevalidation()
  return <CartDrawer />
}
