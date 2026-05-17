import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DeliveryForm } from '@/features/delivery/components/delivery-form'
import { getDeliveryOptionById } from '@/features/delivery/queries'

export const metadata: Metadata = {
  title: 'Modifier l’option de livraison',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDeliveryOptionPage({ params }: PageProps) {
  const { id } = await params
  const option = await getDeliveryOptionById(id)

  if (!option) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Modifier l’option de livraison</h1>
        <p className="text-muted-foreground text-sm">{option.name}</p>
      </header>

      <DeliveryForm initial={option} />
    </div>
  )
}
