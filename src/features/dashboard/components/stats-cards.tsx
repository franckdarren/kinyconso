import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { formatPrice } from '@/lib/utils/format-price'

import type { DashboardStats } from '../queries'

interface StatsCardsProps {
  stats: DashboardStats
}

interface StatCard {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: "Chiffre d'affaires",
      value: formatPrice(stats.revenue),
      icon: TrendingUp,
      hint: `${stats.paidOrdersCount} commande${stats.paidOrdersCount > 1 ? 's' : ''} payée${stats.paidOrdersCount > 1 ? 's' : ''}`,
    },
    {
      label: 'Commandes',
      value: new Intl.NumberFormat('fr-FR').format(stats.ordersCount),
      icon: ShoppingBag,
      hint: `${stats.paidOrdersCount} payée${stats.paidOrdersCount > 1 ? 's' : ''}`,
    },
    {
      label: 'Clients actifs',
      value: new Intl.NumberFormat('fr-FR').format(stats.customersCount),
      icon: Users,
    },
    {
      label: 'Panier moyen',
      value: formatPrice(stats.averageOrderValue),
      icon: Package,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-card border-border rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {card.label}
            </span>
            <card.icon className="text-muted-foreground h-4 w-4" aria-hidden />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
          {card.hint && <p className="text-muted-foreground mt-1 text-xs">{card.hint}</p>}
        </div>
      ))}
    </div>
  )
}
