import { cn } from '@/lib/utils/cn'
import type { OrderStatus } from '@/db/schema/enums'

import { STATUS_LABELS } from '../state-machine'

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  refunded: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
