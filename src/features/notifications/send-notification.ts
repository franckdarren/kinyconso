import 'server-only'

import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { notifications, users } from '@/db/schema'
import type { NotificationType } from '@/db/schema/enums'

import { sendFcmPush } from './fcm/send'

export interface SendNotificationInput {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Insère la notification en base puis tente de pousser un FCM si l'utilisateur
 * a un token enregistré. Les erreurs FCM n'interrompent jamais le flux : la
 * notification reste lisible depuis `/compte/notifications`.
 *
 * Si FCM répond `invalidToken`, on purge `users.fcm_token` pour éviter de
 * réessayer en boucle.
 */
export async function sendNotification(input: SendNotificationInput): Promise<void> {
  const dataJson = input.data ?? null

  const [inserted] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: dataJson,
    })
    .returning({ id: notifications.id })

  const [user] = await db
    .select({ fcmToken: users.fcmToken })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1)

  if (!user?.fcmToken) return

  const pushData: Record<string, string> = {}
  if (input.data) {
    for (const [k, v] of Object.entries(input.data)) {
      if (v === undefined || v === null) continue
      pushData[k] = typeof v === 'string' ? v : JSON.stringify(v)
    }
  }
  pushData.notificationId = inserted?.id ?? ''
  pushData.type = input.type

  const link = resolveNotificationLink(input.type, input.data)

  const result = await sendFcmPush(user.fcmToken, {
    title: input.title,
    body: input.body,
    data: pushData,
    link,
  })

  if (result.ok) {
    if (inserted?.id) {
      await db
        .update(notifications)
        .set({ sentAt: new Date() })
        .where(eq(notifications.id, inserted.id))
    }
    return
  }

  if (result.invalidToken) {
    await db
      .update(users)
      .set({ fcmToken: null, updatedAt: new Date() })
      .where(eq(users.id, input.userId))
  }
}

function resolveNotificationLink(
  type: NotificationType,
  data?: Record<string, unknown>,
): string | undefined {
  const orderId = typeof data?.orderId === 'string' ? data.orderId : undefined
  switch (type) {
    case 'order_confirmed':
    case 'order_shipped':
    case 'order_delivered':
    case 'payment_success':
    case 'payment_failed':
      return orderId ? `/commandes/${orderId}` : '/compte/commandes'
    case 'promo':
      return '/produits'
    default:
      return undefined
  }
}
