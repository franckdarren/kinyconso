'use client'

import { useShallow } from 'zustand/react/shallow'

import { useCartStore, type CartLine } from '@/stores/cart.store'

export interface UseCartResult {
  items: CartLine[]
  itemCount: number
  subtotal: number
  hasHydrated: boolean
  isDrawerOpen: boolean

  addItem: (item: Omit<CartLine, 'quantity'> & { quantity?: number }) => {
    success: boolean
    error?: string
  }
  updateQuantity: (productId: string, quantity: number) => { success: boolean; error?: string }
  removeItem: (productId: string) => void
  clearCart: () => void

  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

export function useCart(): UseCartResult {
  const state = useCartStore(
    useShallow((s) => ({
      items: s.items,
      hasHydrated: s.hasHydrated,
      isDrawerOpen: s.isDrawerOpen,
      addItem: s.addItem,
      updateQuantity: s.updateQuantity,
      removeItem: s.removeItem,
      clearCart: s.clearCart,
      setDrawerOpen: s.setDrawerOpen,
    })),
  )

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  return {
    items: state.items,
    itemCount,
    subtotal,
    hasHydrated: state.hasHydrated,
    isDrawerOpen: state.isDrawerOpen,
    addItem: state.addItem,
    updateQuantity: state.updateQuantity,
    removeItem: state.removeItem,
    clearCart: state.clearCart,
    openDrawer: () => state.setDrawerOpen(true),
    closeDrawer: () => state.setDrawerOpen(false),
    toggleDrawer: () => state.setDrawerOpen(!state.isDrawerOpen),
  }
}
