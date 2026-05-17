import 'server-only'

import { db } from '@/db'
import { notifications } from '@/db/schema'
import type { NotificationType } from '@/db/schema/enums'

export interface SendNotificationInput {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Insère une notification en base. L'envoi push FCM sera branché en phase 14
 * (lecture du `users.fcm_token` + appel FCM HTTP v1). Pour l'instant on
 * persiste uniquement la notification afin qu'elle apparaisse dans le centre
 * de notifications en base.
 */
export async function sendNotification(input: SendNotificationInput): Promise<void> {
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data ?? null,
  })
}
