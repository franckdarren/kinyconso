'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils/cn'

import type { CheckoutStep } from '../stores/checkout.store'

interface StepperProps {
  current: CheckoutStep
}

const STEPS: { id: CheckoutStep; label: string; short: string }[] = [
  { id: 'address', label: 'Adresse de livraison', short: 'Adresse' },
  { id: 'delivery', label: 'Option de livraison', short: 'Livraison' },
  { id: 'payment', label: 'Paiement', short: 'Paiement' },
]

export function Stepper({ current }: StepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current)

  return (
    <ol className="flex items-center justify-between gap-1" aria-label="Étapes du checkout">
      {STEPS.map((step, index) => {
        const isCurrent = step.id === current
        const isDone = index < currentIndex

        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                  isDone && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary bg-background',
                  !isCurrent && !isDone && 'border-border text-muted-foreground bg-background',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-xs sm:text-sm',
                  isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short}</span>
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'mx-2 h-px flex-1',
                  index < currentIndex ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
