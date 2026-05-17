import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { NotificationList } from '@/features/notifications/components/notification-list'
import { getUserNotifications } from '@/features/notifications/queries'

export const metadata: Metadata = {
  title: 'Mes notifications',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/connexion?redirectTo=/compte/notifications')
  }

  const items = await getUserNotifications(user.id, 100)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Historique des notifications liées à vos commandes et promotions.
        </p>
      </header>

      <NotificationList initial={items} />
    </div>
  )
}
