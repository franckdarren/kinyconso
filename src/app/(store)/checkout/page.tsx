import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { users } from '@/db/schema'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { CheckoutForm } from '@/features/checkout/components/checkout-form'
import { getActiveDeliveryOptions } from '@/features/delivery/queries'

export const metadata: Metadata = {
  title: 'Paiement',
  description: 'Finalisez votre commande KinyConso en toute sécurité.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/auth/connexion?redirectTo=/checkout')
  }

  const [profile] = await db
    .select({
      fullName: users.fullName,
      phone: users.phone,
      address: users.address,
      city: users.city,
    })
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1)

  const deliveryOptions = await getActiveDeliveryOptions()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Paiement</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Finalisez votre commande en quelques étapes.
        </p>
      </header>

      <CheckoutForm
        deliveryOptions={deliveryOptions}
        user={{
          fullName: profile?.fullName ?? currentUser.fullName,
          phone: profile?.phone ?? currentUser.phone,
          city: profile?.city ?? null,
          address: profile?.address ?? null,
        }}
      />
    </div>
  )
}
