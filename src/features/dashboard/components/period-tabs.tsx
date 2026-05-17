import Link from 'next/link'

import { cn } from '@/lib/utils/cn'

import { PERIOD_LABELS, type PeriodKey } from '../period'

interface PeriodTabsProps {
  active: PeriodKey
  basePath?: string
}

const ORDER: PeriodKey[] = ['today', '7d', '30d', '90d']

export function PeriodTabs({ active, basePath = '/admin' }: PeriodTabsProps) {
  return (
    <nav
      aria-label="Plage temporelle"
      className="border-border bg-card inline-flex rounded-md border p-0.5 text-xs shadow-sm"
    >
      {ORDER.map((key) => {
        const isActive = key === active
        const href = key === '30d' ? basePath : `${basePath}?period=${key}`
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded px-3 py-1.5 font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            {PERIOD_LABELS[key]}
          </Link>
        )
      })}
    </nav>
  )
}
