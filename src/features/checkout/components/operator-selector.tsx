'use client'

import { CreditCard, Smartphone } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import type { PaymentOperator } from '@/db/schema/enums'

interface OperatorOption {
  value: PaymentOperator
  label: string
  description: string
  icon: 'mobile' | 'card'
}

const OPERATORS: OperatorOption[] = [
  {
    value: 'AIRTEL_MONEY',
    label: 'Airtel Money',
    description: 'Paiement via Airtel Money (Gabon)',
    icon: 'mobile',
  },
  {
    value: 'MOOV_MONEY',
    label: 'Moov Money',
    description: 'Paiement via Moov Money (Gabon)',
    icon: 'mobile',
  },
  {
    value: 'VISA_MASTERCARD',
    label: 'Carte bancaire',
    description: 'Visa, Mastercard',
    icon: 'card',
  },
]

interface OperatorSelectorProps {
  value: PaymentOperator | null
  onChange: (operator: PaymentOperator) => void
  disabled?: boolean
}

export function OperatorSelector({ value, onChange, disabled }: OperatorSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Moyen de paiement" className="space-y-3">
      {OPERATORS.map((op) => {
        const checked = value === op.value
        const Icon = op.icon === 'card' ? CreditCard : Smartphone
        return (
          <label
            key={op.value}
            className={cn(
              'border-border bg-background flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
              'hover:border-primary/60',
              checked && 'border-primary ring-primary/30 ring-2',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            <input
              type="radio"
              name="operator"
              value={op.value}
              checked={checked}
              onChange={() => onChange(op.value)}
              disabled={disabled}
              className="h-4 w-4 shrink-0"
              aria-label={op.label}
            />

            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                checked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
              )}
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-foreground font-medium">{op.label}</p>
              <p className="text-muted-foreground text-xs">{op.description}</p>
            </div>
          </label>
        )
      })}
    </div>
  )
}
