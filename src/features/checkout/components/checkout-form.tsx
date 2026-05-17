'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { useCart } from '@/features/cart/hooks/use-cart'
import type { DeliveryOption } from '@/db/schema'

import { useCheckoutStore } from '../stores/checkout.store'

import { AddressStep } from './address-step'
import { DeliveryStep } from './delivery-step'
import { OrderSummary } from './order-summary'
import { PaymentStep } from './payment-step'
import { Stepper } from './stepper'

interface CheckoutFormProps {
  deliveryOptions: DeliveryOption[]
  user: {
    fullName: string | null
    phone: string | null
    city: string | null
    address: string | null
  } | null
}

export function CheckoutForm({ deliveryOptions, user }: CheckoutFormProps) {
  const router = useRouter()
  const { items, subtotal, hasHydrated } = useCart()

  const step = useCheckoutStore((s) => s.step)
  const setStep = useCheckoutStore((s) => s.setStep)
  const storedDeliveryId = useCheckoutStore((s) => s.deliveryOptionId)
  const storedAddress = useCheckoutStore((s) => s.address)

  const selectedDelivery = useMemo(
    () => deliveryOptions.find((o) => o.id === storedDeliveryId) ?? null,
    [deliveryOptions, storedDeliveryId],
  )

  useEffect(() => {
    if (hasHydrated && items.length === 0) {
      router.replace('/panier')
    }
  }, [hasHydrated, items.length, router])

  // Si l'utilisateur arrive sur l'étape livraison/paiement sans avoir
  // complété l'étape précédente, on recule automatiquement.
  useEffect(() => {
    if (step !== 'address' && !storedAddress) setStep('address')
    if (step === 'payment' && !storedDeliveryId) setStep('delivery')
  }, [step, storedAddress, storedDeliveryId, setStep])

  if (!hasHydrated) {
    return <LoadingSpinner className="py-16" />
  }

  if (items.length === 0) {
    return (
      <div className="border-border bg-muted/30 flex flex-col items-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <ShoppingCart className="text-muted-foreground h-10 w-10" />
        <p className="font-medium">Votre panier est vide</p>
        <Button asChild className="mt-2">
          <Link href="/produits">Voir les produits</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Stepper current={step} />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
          {step === 'address' && (
            <AddressStep
              defaults={
                storedAddress ?? {
                  fullName: user?.fullName ?? '',
                  phone: user?.phone ?? '',
                  city: user?.city ?? '',
                  address: user?.address ?? '',
                }
              }
            />
          )}
          {step === 'delivery' && <DeliveryStep options={deliveryOptions} />}
          {step === 'payment' && <PaymentStep defaultPhone={user?.phone ?? undefined} />}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            deliveryFee={selectedDelivery?.price ?? null}
            deliveryLabel={selectedDelivery?.name ?? null}
          />
        </aside>
      </div>
    </div>
  )
}
