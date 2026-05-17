'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

import { markAllNotificationsAsRead, markNotificationAsRead } from '../actions/mark-as-read'
import type { NotificationRow } from '../queries'
import { NotificationIcon } from './notification-icon'

interface NotificationListProps {
  initial: NotificationRow[]
}

type OptimisticAction = { kind: 'mark-one'; id: string } | { kind: 'mark-all' }

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

function getLink(notification: NotificationRow): string | null {
  const data = notification.data as { orderId?: unknown; link?: unknown } | null
  if (typeof data?.link === 'string') return data.link
  if (typeof data?.orderId === 'string') return `/commandes/${data.orderId}`
  return null
}

function applyAction(items: NotificationRow[], action: OptimisticAction): NotificationRow[] {
  if (action.kind === 'mark-all') {
    return items.map((n) => (n.isRead ? n : { ...n, isRead: true }))
  }
  return items.map((n) => (n.id === action.id ? { ...n, isRead: true } : n))
}

export function NotificationList({ initial }: NotificationListProps) {
  const router = useRouter()
  const [items, addOptimistic] = useOptimistic<NotificationRow[], OptimisticAction>(
    initial,
    applyAction,
  )
  const [, startTransition] = useTransition()
  const unread = items.filter((n) => !n.isRead).length

  function handleMarkOne(id: string) {
    startTransition(async () => {
      addOptimistic({ kind: 'mark-one', id })
      const result = await markNotificationAsRead(id)
      if (!result.success) {
        toast.error(result.error)
      }
      router.refresh()
    })
  }

  function handleMarkAll() {
    if (unread === 0) return
    startTransition(async () => {
      addOptimistic({ kind: 'mark-all' })
      const result = await markAllNotificationsAsRead()
      if (!result.success) {
        toast.error(result.error)
      }
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <div className="bg-card border-border rounded-lg border p-8 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">Aucune notification pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {unread === 0
            ? 'Toutes les notifications sont lues.'
            : `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}.`}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkAll}
          disabled={unread === 0}
          className="h-8 gap-1"
        >
          <Check className="h-3.5 w-3.5" />
          Tout marquer comme lu
        </Button>
      </div>

      <ul className="bg-card border-border divide-border divide-y overflow-hidden rounded-lg border shadow-sm">
        {items.map((notification) => {
          const link = getLink(notification)
          const Body = (
            <div className="flex items-start gap-3 p-4">
              <NotificationIcon type={notification.type} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm',
                      !notification.isRead ? 'font-semibold' : 'font-medium',
                    )}
                  >
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span aria-hidden className="bg-primary mt-1 h-2 w-2 shrink-0 rounded-full" />
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{notification.body}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {dateFormatter.format(notification.createdAt)}
                </p>
              </div>
            </div>
          )

          return (
            <li
              key={notification.id}
              className={cn('group', !notification.isRead && 'bg-primary/5')}
            >
              {link ? (
                <Link
                  href={link}
                  onClick={() => !notification.isRead && handleMarkOne(notification.id)}
                  className="hover:bg-muted/50 block transition-colors"
                >
                  {Body}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => !notification.isRead && handleMarkOne(notification.id)}
                  className="hover:bg-muted/50 block w-full text-left transition-colors"
                >
                  {Body}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
