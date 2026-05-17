'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { users } from '@/db/schema'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

const tokenSchema = z.string().min(20).max(4096)

export async function registerFcmToken(token: string): Promise<ActionResult<{ ok: true }>> {
  const parsed = tokenSchema.safeParse(token)
  if (!parsed.success) {
    return { success: false, error: 'Token FCM invalide' }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  await db
    .update(users)
    .set({ fcmToken: parsed.data, updatedAt: new Date() })
    .where(eq(users.id, user.id))

  return { success: true, data: { ok: true } }
}

export async function unregisterFcmToken(): Promise<ActionResult<{ ok: true }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  await db.update(users).set({ fcmToken: null, updatedAt: new Date() }).where(eq(users.id, user.id))

  return { success: true, data: { ok: true } }
}
