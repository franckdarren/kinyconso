'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { PaymentOperator } from '@/db/schema/enums'

export type CheckoutStep = 'address' | 'delivery' | 'payment'

export interface CheckoutAddress {
  fullName: string
  phone: string
  address: string
  city: string
  notes?: string
}

export interface CheckoutPayment {
  operator: PaymentOperator | null
  customerPhone: string
}

export interface CheckoutState {
  step: CheckoutStep
  address: CheckoutAddress | null
  deliveryOptionId: string | null
  payment: CheckoutPayment

  setStep: (step: CheckoutStep) => void
  goNext: () => void
  goBack: () => void

  setAddress: (address: CheckoutAddress) => void
  setDeliveryOptionId: (id: string) => void
  setPayment: (payment: CheckoutPayment) => void
  reset: () => void
}

const ORDER: CheckoutStep[] = ['address', 'delivery', 'payment']
const STORAGE_KEY = 'kinyconso:checkout'

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      step: 'address',
      address: null,
      deliveryOptionId: null,
      payment: { operator: null, customerPhone: '' },

      setStep: (step) => set({ step }),
      goNext: () => {
        const idx = ORDER.indexOf(get().step)
        const next = ORDER[Math.min(idx + 1, ORDER.length - 1)]
        if (next) set({ step: next })
      },
      goBack: () => {
        const idx = ORDER.indexOf(get().step)
        const prev = ORDER[Math.max(idx - 1, 0)]
        if (prev) set({ step: prev })
      },

      setAddress: (address) => set({ address }),
      setDeliveryOptionId: (id) => set({ deliveryOptionId: id }),
      setPayment: (payment) => set({ payment }),

      reset: () =>
        set({
          step: 'address',
          address: null,
          deliveryOptionId: null,
          payment: { operator: null, customerPhone: '' },
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        address: state.address,
        deliveryOptionId: state.deliveryOptionId,
        payment: state.payment,
      }),
    },
  ),
)
