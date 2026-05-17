import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { formatPrice } from '@/lib/utils/format-price'

import type { OrderListRow } from '../queries'
import { OrderStatusBadge } from './order-status-badge'

interface OrderListProps {
  rows: OrderListRow[]
  basePath: '/commandes' | '/admin/commandes'
  emptyLabel?: string
  showCustomer?: boolean
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function OrderList({
  rows,
  basePath,
  emptyLabel = 'Aucune commande.',
  showCustomer = false,
}: OrderListProps) {
  if (rows.length === 0) {
    return (
      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-lg border">
      {rows.map((order) => (
        <li key={order.id}>
          <Link
            href={`${basePath}/${order.id}`}
            className="hover:bg-muted/50 flex items-center gap-4 px-4 py-3 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{order.orderNumber}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {dateFormatter.format(order.createdAt)} · {order.itemsCount} article(s)
                {showCustomer && order.customerName && (
                  <>
                    {' · '}
                    <span className="text-foreground">{order.customerName}</span>
                  </>
                )}
              </p>
            </div>
            <p className="shrink-0 font-semibold">{formatPrice(order.total)}</p>
            <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}
