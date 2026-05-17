import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { orders, payments } from '@/db/schema'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { PaymentPending } from '@/features/checkout/components/payment-pending'

export const metadata: Metadata = {
  title: 'Paiement en cours',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}

export default async function CheckoutPaymentPage({ params, searchParams }: PageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams])

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect(`/auth/connexion?redirectTo=/checkout/${id}/paiement`)
  }

  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      userId: orders.userId,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1)

  if (!order) notFound()
  if (order.userId !== currentUser.id && currentUser.role !== 'admin') {
    redirect('/commandes')
  }

  // Le paiement déjà confirmé : rediriger directement vers la commande.
  if (order.status !== 'pending') {
    redirect(`/commandes/${order.id}`)
  }

  // Recharge la référence si non fournie en query string.
  let merchantReferenceId = sp.ref ?? null
  if (!merchantReferenceId) {
    const [payment] = await db
      .select({ merchantReferenceId: payments.merchantReferenceId })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1)
    merchantReferenceId = payment?.merchantReferenceId ?? null
  }

  if (!merchantReferenceId) notFound()

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <PaymentPending
        orderId={order.id}
        orderNumber={order.orderNumber}
        merchantReferenceId={merchantReferenceId}
      />
    </div>
  )
}
