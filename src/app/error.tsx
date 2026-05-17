'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-destructive/10 rounded-full p-6">
        <AlertCircle className="text-destructive h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Une erreur est survenue</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="text-muted-foreground font-mono text-xs">Réf. : {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Réessayer
        </Button>
        <Button asChild>
          <Link href="/">Accueil</Link>
        </Button>
      </div>
    </div>
  )
}
