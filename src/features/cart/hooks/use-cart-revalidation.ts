'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { useCartStore } from '@/stores/cart.store'

import { getCartProductSnapshots } from '../actions/get-cart-snapshots'

/**
 * Vérifie périodiquement que les produits du panier sont toujours disponibles
 * et que leur prix n'a pas changé. Ajuste automatiquement les quantités si
 * le stock a baissé, retire les produits supprimés/désactivés.
 *
 * À monter une seule fois dans l'app (root layout client).
 */
export function useCartRevalidation() {
  const hasHydrated = useCartStore((s) => s.hasHydrated)
  const items = useCartStore((s) => s.items)
  const replaceItems = useCartStore((s) => s.replaceItems)
  const lastRunRef = useRef<number>(0)

  useEffect(() => {
    if (!hasHydrated || items.length === 0) return

    // throttling : 1 fois par minute max
    const now = Date.now()
    if (now - lastRunRef.current < 60_000) return
    lastRunRef.current = now

    const run = async () => {
      try {
        const ids = items.map((i) => i.productId)
        const snapshots = await getCartProductSnapshots(ids)

        const updates: typeof items = []
        let removedCount = 0
        let priceChangedCount = 0
        let stockAdjustedCount = 0

        for (const line of items) {
          const snap = snapshots[line.productId]
          if (!snap || !snap.isActive) {
            removedCount += 1
            continue
          }
          let nextQty = line.quantity
          let nextPrice = line.unitPrice
          if (snap.stockQuantity < line.quantity) {
            nextQty = snap.stockQuantity
            if (nextQty === 0) {
              removedCount += 1
              continue
            }
            stockAdjustedCount += 1
          }
          if (snap.price !== line.unitPrice) {
            nextPrice = snap.price
            priceChangedCount += 1
          }
          updates.push({
            ...line,
            quantity: nextQty,
            unitPrice: nextPrice,
            maxStock: snap.stockQuantity,
            name: snap.name,
            image: snap.image,
          })
        }

        if (
          removedCount > 0 ||
          priceChangedCount > 0 ||
          stockAdjustedCount > 0 ||
          updates.length !== items.length
        ) {
          replaceItems(updates)
          if (removedCount > 0) {
            toast.warning(`${removedCount} produit(s) retiré(s) du panier (indisponibles)`)
          }
          if (stockAdjustedCount > 0) {
            toast.warning(`${stockAdjustedCount} quantité(s) ajustée(s) au stock disponible`)
          }
          if (priceChangedCount > 0) {
            toast.info(`${priceChangedCount} prix mis à jour`)
          }
        }
      } catch {
        // silent — pas critique si la revalidation échoue
      }
    }

    void run()
  }, [hasHydrated, items, replaceItems])
}
