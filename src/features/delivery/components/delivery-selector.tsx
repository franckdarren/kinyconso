'use client'

import { Truck } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/format-price'
import type { DeliveryOption } from '@/db/schema'

interface DeliverySelectorProps {
  options: DeliveryOption[]
  value: string | null
  onChange: (id: string) => void
  disabled?: boolean
  name?: string
}

function formatEstimatedDays(days: number | null): string | null {
  if (days === null || days === undefined) return null
  if (days === 0) return 'Le jour même'
  if (days === 1) return 'Sous 1 jour'
  return `Sous ${days} jours`
}

export function DeliverySelector({
  options,
  value,
  onChange,
  disabled,
  name = 'deliveryOptionId',
}: DeliverySelectorProps) {
  if (options.length === 0) {
    return (
      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Aucune option de livraison disponible pour le moment.
        </p>
      </div>
    )
  }

  return (
    <div role="radiogroup" aria-label="Option de livraison" className="space-y-3">
      {options.map((option) => {
        const checked = option.id === value
        const estimated = formatEstimatedDays(option.estimatedDays)
        return (
          <label
            key={option.id}
            className={cn(
              'border-border bg-background flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
              'hover:border-primary/60',
              checked && 'border-primary ring-primary/30 ring-2',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={checked}
              onChange={() => onChange(option.id)}
              disabled={disabled}
              className="mt-1 h-4 w-4 shrink-0"
              aria-label={option.name}
            />

            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                checked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
              )}
              aria-hidden
            >
              <Truck className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-foreground font-medium">{option.name}</p>
                <p className="text-foreground shrink-0 font-semibold">
                  {option.price === 0 ? 'Gratuit' : formatPrice(option.price)}
                </p>
              </div>
              {estimated && <p className="text-muted-foreground mt-0.5 text-xs">{estimated}</p>}
              {option.description && (
                <p className="text-muted-foreground mt-1 text-sm">{option.description}</p>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )
}
