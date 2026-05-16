import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  className?: string
  label?: string
}

export function LoadingSpinner({ className, label = 'Chargement…' }: LoadingSpinnerProps) {
  return (
    <div className={cn('text-muted-foreground flex items-center justify-center gap-2', className)}>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
