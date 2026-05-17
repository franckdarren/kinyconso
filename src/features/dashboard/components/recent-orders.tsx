import Link from 'next/link'

import { OrderStatusBadge } from '@/features/orders/components/order-status-badge'
import type { OrderListRow } from '@/features/orders/queries'
import { formatPrice } from '@/lib/utils/format-price'

interface RecentOrdersProps {
  orders: OrderListRow[]
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
      <header className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Dernières commandes</h2>
        <Link
          href="/admin/commandes"
          className="text-muted-foreground hover:text-foreground text-xs font-medium"
        >
          Voir tout
        </Link>
      </header>

      {orders.length === 0 ? (
        <p className="text-muted-foreground mt-3 text-sm">Aucune commande pour le moment.</p>
      ) : (
        <ul className="divide-border mt-3 divide-y">
          {orders.map((order) => (
            <li key={order.id} className="py-2.5">
              <Link
                href={`/admin/commandes/${order.id}`}
                className="hover:bg-muted/40 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {order.customerName ?? '—'} · {dateFormatter.format(order.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="w-24 text-right text-sm font-medium tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
