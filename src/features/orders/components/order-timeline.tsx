import { Ban, Check, CircleDot } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import type { OrderStatus } from '@/db/schema/enums'

import { ORDER_TIMELINE, STATUS_LABELS } from '../state-machine'

interface OrderTimelineProps {
  status: OrderStatus
  className?: string
}

export function OrderTimeline({ status, className }: OrderTimelineProps) {
  const isCancelled = status === 'cancelled'
  const isRefunded = status === 'refunded'
  const activeIndex = isCancelled || isRefunded ? -1 : ORDER_TIMELINE.indexOf(status)

  return (
    <ol
      className={cn('border-border bg-muted/30 rounded-lg border p-4', className)}
      aria-label="Progression de la commande"
    >
      {ORDER_TIMELINE.map((step, index) => {
        const isDone = activeIndex > index
        const isCurrent = activeIndex === index
        const Icon = isDone ? Check : isCurrent ? CircleDot : null
        return (
          <li
            key={step}
            className={cn(
              'flex items-center gap-3 py-2',
              isCurrent && 'text-foreground font-medium',
              !isDone && !isCurrent && 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs',
                isDone && 'bg-primary border-primary text-primary-foreground',
                isCurrent && 'border-primary text-primary bg-background',
                !isCurrent && !isDone && 'border-border bg-background',
              )}
            >
              {Icon ? <Icon className="h-4 w-4" aria-hidden /> : index + 1}
            </span>
            <span className="text-sm">{STATUS_LABELS[step]}</span>
          </li>
        )
      })}

      {(isCancelled || isRefunded) && (
        <li className="border-border mt-2 flex items-center gap-3 border-t pt-3">
          <span className="bg-destructive text-destructive-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
            <Ban className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-foreground text-sm font-medium">{STATUS_LABELS[status]}</span>
        </li>
      )}
    </ol>
  )
}
