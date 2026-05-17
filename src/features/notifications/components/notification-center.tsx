'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import { Bell, BellRing, Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

import { markAllNotificationsAsRead, markNotificationAsRead } from '../actions/mark-as-read'
import { useFcmToken } from '../hooks/use-fcm-token'
import type { NotificationRow } from '../queries'
import { NotificationIcon } from './notification-icon'

interface NotificationCenterProps {
  initialNotifications: NotificationRow[]
  initialUnreadCount: number
  isAuthenticated: boolean
}

type OptimisticAction = { kind: 'mark-one'; id: string } | { kind: 'mark-all' }

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function getNotificationLink(notification: NotificationRow): string {
  const data = notification.data as { orderId?: unknown; link?: unknown } | null
  if (typeof data?.link === 'string') return data.link
  if (typeof data?.orderId === 'string') return `/commandes/${data.orderId}`
  return '/compte/notifications'
}

function applyAction(items: NotificationRow[], action: OptimisticAction): NotificationRow[] {
  if (action.kind === 'mark-all') {
    return items.map((n) => (n.isRead ? n : { ...n, isRead: true }))
  }
  return items.map((n) => (n.id === action.id ? { ...n, isRead: true } : n))
}

export function NotificationCenter({
  initialNotifications,
  initialUnreadCount,
  isAuthenticated,
}: NotificationCenterProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const [items, addOptimistic] = useOptimistic<NotificationRow[], OptimisticAction>(
    initialNotifications,
    applyAction,
  )
  const ref = useRef<HTMLDivElement>(null)

  const onForegroundMessageHandler = useCallback(
    (payload: { title: string; body: string; data: Record<string, string> }) => {
      toast(payload.title, {
        description: payload.body,
        action: payload.data.link
          ? { label: 'Voir', onClick: () => router.push(payload.data.link as string) }
          : undefined,
      })
      router.refresh()
    },
    [router],
  )

  const {
    permission,
    enable,
    isPending: isEnabling,
  } = useFcmToken({
    enabled: isAuthenticated,
    onForegroundMessage: onForegroundMessageHandler,
  })

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const visibleUnread = items.filter((n) => !n.isRead).length
  const initiallyVisibleUnread = initialNotifications.filter((n) => !n.isRead).length
  const optimisticDelta = initiallyVisibleUnread - visibleUnread
  const displayUnread = Math.max(initialUnreadCount - optimisticDelta, 0)

  function handleClick(notification: NotificationRow) {
    const link = getNotificationLink(notification)
    setOpen(false)
    if (!notification.isRead) {
      startTransition(async () => {
        addOptimistic({ kind: 'mark-one', id: notification.id })
        await markNotificationAsRead(notification.id)
        router.refresh()
      })
    }
    router.push(link)
  }

  function handleMarkAll() {
    if (visibleUnread === 0) return
    startTransition(async () => {
      addOptimistic({ kind: 'mark-all' })
      await markAllNotificationsAsRead()
      router.refresh()
    })
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Notifications${
          displayUnread > 0 ? ` (${displayUnread} non lue${displayUnread > 1 ? 's' : ''})` : ''
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        {displayUnread > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {displayUnread > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold">
            {displayUnread > 9 ? '9+' : displayUnread}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="bg-popover border-border absolute right-0 z-50 mt-2 flex max-h-[80vh] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border shadow-lg"
        >
          <header className="border-border flex items-center justify-between gap-2 border-b px-3 py-2">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAll}
                disabled={visibleUnread === 0}
                className="h-7 gap-1 px-2 text-xs"
              >
                <Check className="h-3 w-3" />
                Tout lire
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="h-7 w-7"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </header>

          {permission !== 'granted' && permission !== 'unsupported' && (
            <div className="bg-muted/50 border-border border-b px-3 py-2 text-xs">
              <p className="text-muted-foreground">
                Activez les notifications push pour être averti en temps réel.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 h-7 text-xs"
                onClick={() => void enable()}
                disabled={isEnabling || permission === 'denied'}
              >
                {permission === 'denied'
                  ? 'Bloquées par le navigateur'
                  : 'Activer les notifications'}
              </Button>
            </div>
          )}

          <ul className="divide-border flex-1 divide-y overflow-y-auto">
            {items.length === 0 ? (
              <li className="text-muted-foreground px-4 py-8 text-center text-sm">
                Aucune notification pour le moment.
              </li>
            ) : (
              items.slice(0, 8).map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(notification)}
                    className={cn(
                      'hover:bg-muted flex w-full items-start gap-3 px-3 py-3 text-left transition-colors',
                      !notification.isRead && 'bg-primary/5',
                    )}
                  >
                    <NotificationIcon type={notification.type} className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm',
                          !notification.isRead ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {notification.body}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[10px]">
                        {dateFormatter.format(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span
                        aria-hidden
                        className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>

          <footer className="border-border border-t">
            <Link
              href="/compte/notifications"
              onClick={() => setOpen(false)}
              className="hover:bg-muted block px-3 py-2 text-center text-xs font-medium"
            >
              Voir toutes les notifications
            </Link>
          </footer>
        </div>
      )}
    </div>
  )
}
