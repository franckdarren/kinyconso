'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartLine {
  productId: string
  slug: string
  name: string
  image: string | null
  unitPrice: number
  quantity: number
  maxStock: number
}

export interface CartState {
  items: CartLine[]
  isDrawerOpen: boolean
  hasHydrated: boolean
  lastSyncedAt: number | null

  addItem: (item: Omit<CartLine, 'quantity'> & { quantity?: number }) => {
    success: boolean
    error?: string
  }
  updateQuantity: (productId: string, quantity: number) => { success: boolean; error?: string }
  removeItem: (productId: string) => void
  clearCart: () => void

  setDrawerOpen: (open: boolean) => void
  setHasHydrated: (value: boolean) => void
  replaceItems: (items: CartLine[]) => void

  getItemCount: () => number
  getSubtotal: () => number
}

const STORAGE_KEY = 'kinyconso:cart'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      hasHydrated: false,
      lastSyncedAt: null,

      addItem: (item) => {
        const quantity = item.quantity ?? 1
        if (quantity < 1) return { success: false, error: 'Quantité invalide' }

        const existing = get().items.find((i) => i.productId === item.productId)
        const desired = (existing?.quantity ?? 0) + quantity

        if (desired > item.maxStock) {
          return {
            success: false,
            error:
              item.maxStock === 0
                ? 'Produit en rupture de stock'
                : `Stock insuffisant (${item.maxStock} disponible(s))`,
          }
        }

        set((state) => {
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: desired, unitPrice: item.unitPrice, maxStock: item.maxStock }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                productId: item.productId,
                slug: item.slug,
                name: item.name,
                image: item.image,
                unitPrice: item.unitPrice,
                quantity,
                maxStock: item.maxStock,
              },
            ],
          }
        })
        return { success: true }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return { success: true }
        }

        const item = get().items.find((i) => i.productId === productId)
        if (!item) return { success: false, error: 'Produit introuvable dans le panier' }

        if (quantity > item.maxStock) {
          return {
            success: false,
            error: `Stock insuffisant (${item.maxStock} disponible(s))`,
          }
        }

        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        }))
        return { success: true }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      clearCart: () => set({ items: [] }),

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      replaceItems: (items) => set({ items, lastSyncedAt: Date.now() }),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, lastSyncedAt: state.lastSyncedAt }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
