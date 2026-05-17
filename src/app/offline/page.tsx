import type { Metadata } from 'next'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { RetryButton } from './retry-button'

export const metadata: Metadata = {
  title: 'Hors ligne',
  robots: { index: false },
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-muted rounded-full p-6">
        <WifiOff className="text-muted-foreground h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Vous êtes hors ligne</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          Vérifiez votre connexion internet et réessayez. Les pages déjà visitées restent
          accessibles.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">Accueil</Link>
        </Button>
        <RetryButton />
      </div>
    </div>
  )
}
