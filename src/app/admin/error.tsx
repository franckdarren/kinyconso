'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function AdminError({
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
        <h2 className="text-2xl font-bold">Erreur dans l&apos;administration</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Une erreur inattendue s&apos;est produite dans le panneau d&apos;administration.
        </p>
        {error.digest && (
          <p className="text-muted-foreground font-mono text-xs">R&eacute;f. : {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          R&eacute;essayer
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Tableau de bord</Link>
        </Button>
      </div>
    </div>
  )
}
