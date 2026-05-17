import { getCurrentUser } from '@/features/auth/queries/get-current-user'

import { getRecentNotifications, getUnreadCount } from '../queries'
import { NotificationCenter } from './notification-center'

export async function NotificationCenterServer() {
  const user = await getCurrentUser()
  if (!user) return null

  const [items, unread] = await Promise.all([
    getRecentNotifications(user.id, 10),
    getUnreadCount(user.id),
  ])

  return (
    <NotificationCenter initialNotifications={items} initialUnreadCount={unread} isAuthenticated />
  )
}
