import type { Metadata } from 'next'

import { DeliveryForm } from '@/features/delivery/components/delivery-form'

export const metadata: Metadata = {
  title: 'Nouvelle option de livraison',
}

export const dynamic = 'force-dynamic'

export default function NewDeliveryOptionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nouvelle option de livraison</h1>
        <p className="text-muted-foreground text-sm">
          Renseignez les informations puis cliquez sur « Créer l’option ».
        </p>
      </header>

      <DeliveryForm />
    </div>
  )
}
