'use server'

import { revalidatePath } from 'next/cache'
import { eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { orderItems, orders, products } from '@/db/schema'
import type { OrderStatus } from '@/db/schema/enums'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import { sendNotification } from '@/features/notifications/send-notification'
import type { ActionResult } from '@/types/actions'

import { STATUS_LABELS, STATUS_NOTIFICATION, canTransition, isTerminal } from '../state-machine'

/**
 * Modifie le statut d'une commande en respectant la machine à états.
 * Si la transition cible `cancelled` depuis un statut où le stock a déjà
 * été décrémenté (>= confirmed), on réincrémente le stock.
 * Une notification est envoyée au client si la transition l'exige.
 */
export async function updateOrderStatus(
  id: string,
  next: OrderStatus,
): Promise<ActionResult<{ id: string; status: OrderStatus }>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      userId: orders.userId,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1)

  if (!order) return { success: false, error: 'Commande introuvable' }

  if (order.status === next) {
    return { success: false, error: 'La commande est déjà dans ce statut' }
  }

  if (!canTransition(order.status, next)) {
    return {
      success: false,
      error: `Transition non autorisée : ${STATUS_LABELS[order.status]} → ${STATUS_LABELS[next]}`,
    }
  }

  // Réincrément du stock si on annule après que la commande ait été confirmée.
  const stockReincrementNeeded =
    next === 'cancelled' && !['pending', 'cancelled'].includes(order.status)

  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status: next, updatedAt: new Date() }).where(eq(orders.id, id))

    if (stockReincrementNeeded) {
      const items = await tx
        .select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, id))

      for (const line of items) {
        await tx
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} + ${line.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, line.productId))
      }
    }
  })

  // Notification au client si applicable.
  const notifType = STATUS_NOTIFICATION[next]
  if (notifType) {
    try {
      const messages: Record<OrderStatus, { title: string; body: string }> = {
        pending: { title: '', body: '' },
        confirmed: {
          title: 'Commande confirmée',
          body: `Votre commande ${order.orderNumber} est confirmée.`,
        },
        processing: { title: '', body: '' },
        shipped: {
          title: 'Commande expédiée',
          body: `Votre commande ${order.orderNumber} est en cours de livraison.`,
        },
        delivered: {
          title: 'Commande livrée',
          body: `Votre commande ${order.orderNumber} a été livrée. Merci !`,
        },
        cancelled: {
          title: 'Commande annulée',
          body: `Votre commande ${order.orderNumber} a été annulée.`,
        },
        refunded: { title: '', body: '' },
      }
      const m = messages[next]
      if (m.title) {
        await sendNotification({
          userId: order.userId,
          type: notifType,
          title: m.title,
          body: m.body,
          data: { orderId: order.id, orderNumber: order.orderNumber, status: next },
        })
      }
    } catch {
      // Ne pas faire échouer la transition pour une notif.
    }
  }

  revalidatePath('/admin/commandes')
  revalidatePath(`/admin/commandes/${id}`)
  revalidatePath(`/commandes/${id}`)
  revalidatePath('/compte/commandes')
  return {
    success: true,
    data: { id, status: next },
  }
}

export async function cancelOrder(
  id: string,
): Promise<ActionResult<{ id: string; status: OrderStatus }>> {
  return updateOrderStatus(id, 'cancelled')
}

export async function refundOrder(
  id: string,
): Promise<ActionResult<{ id: string; status: OrderStatus }>> {
  return updateOrderStatus(id, 'refunded')
}

export async function getNextAllowedStatuses(currentStatus: OrderStatus): Promise<OrderStatus[]> {
  if (isTerminal(currentStatus)) return []
  return Object.entries(STATUS_LABELS)
    .filter(([key]) => canTransition(currentStatus, key as OrderStatus))
    .map(([key]) => key as OrderStatus)
}
