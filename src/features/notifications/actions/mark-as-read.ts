'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { notifications } from '@/db/schema'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

const idSchema = z.uuid()

export async function markNotificationAsRead(id: string): Promise<ActionResult<{ id: string }>> {
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) {
    return { success: false, error: 'Identifiant invalide' }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, parsed.data), eq(notifications.userId, user.id)))

  revalidatePath('/compte/notifications')
  return { success: true, data: { id: parsed.data } }
}

export async function markAllNotificationsAsRead(): Promise<ActionResult<{ ok: true }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)))

  revalidatePath('/compte/notifications')
  return { success: true, data: { ok: true } }
}
