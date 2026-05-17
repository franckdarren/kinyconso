import {
  Bell,
  CheckCircle2,
  Megaphone,
  PackageCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { NotificationType } from '@/db/schema/enums'

const ICONS: Record<NotificationType, LucideIcon> = {
  order_confirmed: ShoppingBag,
  order_shipped: Truck,
  order_delivered: PackageCheck,
  payment_success: CheckCircle2,
  payment_failed: XCircle,
  promo: Megaphone,
}

const COLORS: Record<NotificationType, string> = {
  order_confirmed: 'text-blue-600',
  order_shipped: 'text-indigo-600',
  order_delivered: 'text-emerald-600',
  payment_success: 'text-emerald-600',
  payment_failed: 'text-red-600',
  promo: 'text-amber-600',
}

interface NotificationIconProps {
  type: NotificationType
  className?: string
}

export function NotificationIcon({ type, className }: NotificationIconProps) {
  const Icon = ICONS[type] ?? Bell
  return (
    <Icon className={`h-5 w-5 ${COLORS[type] ?? 'text-muted-foreground'} ${className ?? ''}`} />
  )
}
