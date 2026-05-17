import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { orders, payments } from '@/db/schema'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { pvitCheckStatus } from '@/features/payments/pvit/client'
import { pvitLog } from '@/features/payments/pvit/logger'
import { processPvitCallback } from '@/features/payments/pvit/process-callback'
import { checkStatusQuerySchema } from '@/features/payments/pvit/schemas'
import { PvitError } from '@/features/payments/pvit/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Fallback : si le webhook PVIT n'arrive pas dans les 3 minutes, le client
 * peut interroger directement ce endpoint avec son `merchant_reference_id`.
 * On interroge PVIT, on met à jour la DB si le statut a changé, et on
 * répond avec l'état courant de la commande.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
  }

  const parsed = checkStatusQuerySchema.safeParse({
    reference: request.nextUrl.searchParams.get('reference') ?? '',
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Référence invalide' }, { status: 400 })
  }

  const merchantReferenceId = parsed.data.reference

  const [paymentRow] = await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      status: payments.status,
      pvitTransactionId: payments.pvitTransactionId,
    })
    .from(payments)
    .where(eq(payments.merchantReferenceId, merchantReferenceId))
    .limit(1)

  if (!paymentRow) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
  }

  // Le propriétaire de la commande (ou un admin) peut interroger le statut.
  const [orderRow] = await db
    .select({ userId: orders.userId, orderNumber: orders.orderNumber, status: orders.status })
    .from(orders)
    .where(eq(orders.id, paymentRow.orderId))
    .limit(1)

  if (!orderRow) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  if (orderRow.userId !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // Si le paiement n'est plus pending, on renvoie l'état stocké sans
  // appeler PVIT inutilement.
  if (paymentRow.status !== 'pending') {
    return NextResponse.json({
      merchantReferenceId,
      paymentStatus: paymentRow.status,
      orderId: paymentRow.orderId,
      orderNumber: orderRow.orderNumber,
      orderStatus: orderRow.status,
    })
  }

  try {
    const remote = await pvitCheckStatus({ merchantReferenceId })

    // Si PVIT renvoie un statut terminal, on rejoue le callback handler
    // pour appliquer la transition exactement comme un vrai webhook.
    if (remote.status !== 'PENDING') {
      await processPvitCallback({
        transactionId: remote.transactionId,
        merchantReferenceId,
        status: remote.status,
        responseCode: remote.responseCode,
        amount: remote.amount,
        operator: remote.operator,
        message: remote.message,
      })
    }

    // Relire l'état après mise à jour éventuelle.
    const [refreshedPayment] = await db
      .select({ status: payments.status })
      .from(payments)
      .where(eq(payments.id, paymentRow.id))
      .limit(1)

    const [refreshedOrder] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, paymentRow.orderId))
      .limit(1)

    return NextResponse.json({
      merchantReferenceId,
      paymentStatus: refreshedPayment?.status ?? paymentRow.status,
      orderId: paymentRow.orderId,
      orderNumber: orderRow.orderNumber,
      orderStatus: refreshedOrder?.status ?? orderRow.status,
      remote: { status: remote.status, responseCode: remote.responseCode },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur PVIT'
    pvitLog.error({
      event: 'pvit.route.check_status.failed',
      merchantReferenceId,
      error: message,
    })
    const httpStatus = error instanceof PvitError && error.httpStatus ? error.httpStatus : 502
    return NextResponse.json({ error: message }, { status: httpStatus })
  }
}
