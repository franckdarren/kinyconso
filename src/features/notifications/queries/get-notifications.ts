import 'server-only'

import { and, count, desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { notifications } from '@/db/schema'
import type { Notification } from '@/db/schema/notifications'

export type NotificationRow = Notification

export async function getUserNotifications(userId: string, limit = 50): Promise<NotificationRow[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
  return Number(row?.n ?? 0)
}

export async function getRecentNotifications(
  userId: string,
  limit = 10,
): Promise<NotificationRow[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
}
