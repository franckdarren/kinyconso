import 'server-only'

import { eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { orderItems, orders, payments, products } from '@/db/schema'
import type { PaymentStatus } from '@/db/schema/enums'
import { sendNotification } from '@/features/notifications/send-notification'

import { pvitLog } from './logger'
import type { PvitCallbackPayloadInput } from './schemas'

export type CallbackOutcome =
  | { handled: true; status: PaymentStatus; idempotent: boolean }
  | { handled: false; reason: 'unknown_reference' }

function mapStatus(raw: PvitCallbackPayloadInput['status']): PaymentStatus | null {
  switch (raw) {
    case 'SUCCESS':
      return 'success'
    case 'FAILED':
      return 'failed'
    case 'CANCELLED':
      return 'cancelled'
    case 'PENDING':
      return 'pending'
  }
}

/**
 * Traitement idempotent d'un payload de callback PVIT.
 * Peut être appelé depuis :
 *   - le webhook POST /api/pvit/callback
 *   - la route GET /api/pvit/check-status (fallback polling)
 *
 * Garantit :
 *   - Idempotence stricte sur `merchant_reference_id` :
 *     ne traite que les paiements en `pending`.
 *   - Mise à jour atomique payment + order dans une transaction.
 *   - Décrément stock uniquement si SUCCESS et premier traitement.
 *   - Notification persistée pour l'utilisateur.
 */
export async function processPvitCallback(
  payload: PvitCallbackPayloadInput,
): Promise<CallbackOutcome> {
  const [payment] = await db
    .select({
      id: payments.id,
      orderId: payments.orderId,
      status: payments.status,
    })
    .from(payments)
    .where(eq(payments.merchantReferenceId, payload.merchantReferenceId))
    .limit(1)

  if (!payment) {
    pvitLog.warn({
      event: 'pvit.callback.unknown_reference',
      merchantReferenceId: payload.merchantReferenceId,
    })
    return { handled: false, reason: 'unknown_reference' }
  }

  // Idempotence : tout statut autre que `pending` signifie qu'on a déjà traité
  // un callback pour cette référence. On répond OK sans rien refaire.
  if (payment.status !== 'pending') {
    pvitLog.info({
      event: 'pvit.callback.idempotent_replay',
      merchantReferenceId: payload.merchantReferenceId,
      pvitTransactionId: payload.transactionId,
      status: payment.status,
    })
    return { handled: true, status: payment.status, idempotent: true }
  }

  const targetStatus = mapStatus(payload.status)
  if (!targetStatus) {
    pvitLog.warn({
      event: 'pvit.callback.unknown_status',
      merchantReferenceId: payload.merchantReferenceId,
      status: payload.status,
    })
    return { handled: true, status: payment.status, idempotent: false }
  }
  // PVIT peut renvoyer PENDING (transition intermédiaire) — on ignore.
  if (targetStatus === 'pending') {
    pvitLog.info({
      event: 'pvit.callback.pending',
      merchantReferenceId: payload.merchantReferenceId,
    })
    return { handled: true, status: 'pending', idempotent: false }
  }

  const { order, decrementedStock } = await db.transaction(async (tx) => {
    const [updatedPayment] = await tx
      .update(payments)
      .set({
        status: targetStatus,
        pvitTransactionId: payload.transactionId,
        pvitCallbackReceivedAt: new Date(),
        rawCallbackPayload: payload as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))
      .returning({ id: payments.id })

    if (!updatedPayment) {
      throw new Error('Payment update failed')
    }

    const nextOrderStatus = targetStatus === 'success' ? 'confirmed' : 'pending'

    const [updatedOrder] = await tx
      .update(orders)
      .set({ status: nextOrderStatus, updatedAt: new Date() })
      .where(eq(orders.id, payment.orderId))
      .returning({
        id: orders.id,
        orderNumber: orders.orderNumber,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
      })

    if (!updatedOrder) {
      throw new Error('Order update failed')
    }

    let decremented = false
    if (targetStatus === 'success') {
      const items = await tx
        .select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, payment.orderId))

      for (const line of items) {
        await tx
          .update(products)
          .set({
            stockQuantity: sql`greatest(${products.stockQuantity} - ${line.quantity}, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, line.productId))
      }
      decremented = items.length > 0
    }

    return { order: updatedOrder, decrementedStock: decremented }
  })

  // Notification (persistée en DB ; push FCM réel en phase 14).
  try {
    if (targetStatus === 'success') {
      await sendNotification({
        userId: order.userId,
        type: 'order_confirmed',
        title: 'Commande confirmée',
        body: `Votre commande ${order.orderNumber} a bien été payée.`,
        data: { orderId: order.id, orderNumber: order.orderNumber },
      })
    } else if (targetStatus === 'failed' || targetStatus === 'cancelled') {
      await sendNotification({
        userId: order.userId,
        type: 'payment_failed',
        title: 'Paiement non abouti',
        body: `Le paiement de la commande ${order.orderNumber} n’a pas pu être validé.`,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          reason: payload.message ?? payload.responseCode,
        },
      })
    }
  } catch (cause) {
    // Une notification ratée ne doit pas faire échouer le webhook.
    pvitLog.error({
      event: 'pvit.callback.notification_failed',
      merchantReferenceId: payload.merchantReferenceId,
      error: cause instanceof Error ? cause.message : String(cause),
    })
  }

  pvitLog.info({
    event: 'pvit.callback.processed',
    merchantReferenceId: payload.merchantReferenceId,
    pvitTransactionId: payload.transactionId,
    status: targetStatus,
    decrementedStock,
  })

  return { handled: true, status: targetStatus, idempotent: false }
}
