'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DeliverySelector } from '@/features/delivery/components/delivery-selector'
import type { DeliveryOption } from '@/db/schema'

import { useCheckoutStore } from '../stores/checkout.store'

interface DeliveryStepProps {
  options: DeliveryOption[]
}

export function DeliveryStep({ options }: DeliveryStepProps) {
  const storedId = useCheckoutStore((s) => s.deliveryOptionId)
  const setDeliveryOptionId = useCheckoutStore((s) => s.setDeliveryOptionId)
  const goNext = useCheckoutStore((s) => s.goNext)
  const goBack = useCheckoutStore((s) => s.goBack)

  const fallbackId = useMemo(() => {
    if (storedId && options.some((o) => o.id === storedId)) return storedId
    return options[0]?.id ?? null
  }, [storedId, options])

  const [selected, setSelected] = useState<string | null>(fallbackId)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected) {
      setError('Veuillez sélectionner une option de livraison')
      return
    }
    setError(null)
    setDeliveryOptionId(selected)
    goNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <DeliverySelector
        options={options}
        value={selected}
        onChange={(id) => {
          setSelected(id)
          setError(null)
        }}
      />

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" size="lg" className="min-h-11 gap-2" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
          Adresse
        </Button>
        <Button type="submit" size="lg" className="min-h-11 gap-2" disabled={options.length === 0}>
          Continuer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
