'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { OrderStatus } from '@/db/schema/enums'

import { updateOrderStatus } from '../actions'
import { STATUS_LABELS, isTerminal, ALLOWED_TRANSITIONS } from '../state-machine'

interface OrderStatusActionsProps {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [target, setTarget] = useState<OrderStatus | null>(null)

  if (isTerminal(currentStatus)) {
    return (
      <p className="text-muted-foreground text-xs">
        Cette commande est dans un statut terminal. Aucune transition possible.
      </p>
    )
  }

  const next = ALLOWED_TRANSITIONS[currentStatus]

  const handleClick = (status: OrderStatus) => {
    const needsConfirm = status === 'cancelled' || status === 'refunded'
    if (needsConfirm) {
      const label = STATUS_LABELS[status].toLowerCase()
      if (!window.confirm(`Confirmer le passage en « ${label} » ?`)) return
    }
    setTarget(status)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status)
      setTarget(null)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`Statut mis à jour : ${STATUS_LABELS[status]}`)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((status) => {
        const isCurrentTarget = target === status
        return (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={status === 'cancelled' ? 'destructive' : 'default'}
            onClick={() => handleClick(status)}
            disabled={isPending}
          >
            {isCurrentTarget && <Loader2 className="h-4 w-4 animate-spin" />}
            {STATUS_LABELS[status]}
          </Button>
        )
      })}
    </div>
  )
}
