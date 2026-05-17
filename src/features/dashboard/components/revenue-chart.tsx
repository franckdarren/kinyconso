import { formatPrice } from '@/lib/utils/format-price'

import type { RevenuePoint } from '../queries'

interface RevenueChartProps {
  data: RevenuePoint[]
  title?: string
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' })

/**
 * Graphique SVG minimal et accessible : area chart du CA journalier.
 * Pas de dépendance externe pour rester sous le budget bundle.
 */
export function RevenueChart({ data, title = "Chiffre d'affaires" }: RevenueChartProps) {
  const points = data.length === 0 ? [{ date: '', revenue: 0, orders: 0 }] : data
  const maxRevenue = Math.max(...points.map((p) => p.revenue), 1)
  const total = points.reduce((acc, p) => acc + p.revenue, 0)
  const totalOrders = points.reduce((acc, p) => acc + p.orders, 0)

  const width = 100
  const height = 32
  const step = points.length > 1 ? width / (points.length - 1) : width

  const lineCoords = points.map((p, i) => {
    const x = i * step
    const y = height - (p.revenue / maxRevenue) * (height - 4) - 2
    return { x, y, point: p }
  })

  const linePath = lineCoords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(' ')
  const areaPath = `${linePath} L ${(lineCoords[lineCoords.length - 1]?.x ?? 0).toFixed(2)} ${height} L 0 ${height} Z`

  const ticks: { i: number; label: string }[] = []
  if (points.length > 0) {
    const tickCount = Math.min(points.length, 4)
    for (let t = 0; t < tickCount; t++) {
      const i = Math.round((t * (points.length - 1)) / Math.max(tickCount - 1, 1))
      const p = points[i]
      if (p && p.date) {
        const d = new Date(`${p.date}T00:00:00Z`)
        ticks.push({ i, label: dayFormatter.format(d) })
      }
    }
  }

  const maxLabel = formatPrice(maxRevenue)

  return (
    <section
      className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6"
      aria-label={title}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-muted-foreground text-xs">{points.length} jours</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold tracking-tight">{formatPrice(total)}</p>
          <p className="text-muted-foreground text-xs">
            {totalOrders} commande{totalOrders > 1 ? 's' : ''} payée{totalOrders > 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="text-primary h-32 w-full"
          role="img"
          aria-label={`Courbe du chiffre d'affaires sur ${points.length} jours`}
        >
          <defs>
            <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#revenue-area)" />
          <path d={linePath} fill="none" stroke="currentColor" strokeWidth="0.5" />
          {lineCoords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r="0.6"
              fill="currentColor"
              opacity={c.point.revenue > 0 ? 1 : 0.2}
            >
              <title>
                {c.point.date} — {formatPrice(c.point.revenue)} ({c.point.orders} cmd)
              </title>
            </circle>
          ))}
        </svg>

        <div className="text-muted-foreground mt-2 flex justify-between text-[10px]">
          {ticks.map((t) => (
            <span key={`${t.i}-${t.label}`}>{t.label}</span>
          ))}
        </div>
        <div className="text-muted-foreground mt-1 flex justify-between text-[10px]">
          <span>0</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </section>
  )
}
