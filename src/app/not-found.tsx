import type { Metadata } from 'next'
import Link from 'next/link'
import { PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-muted rounded-full p-6">
        <PackageSearch className="text-muted-foreground h-12 w-12" />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-7xl font-bold">404</p>
        <h2 className="text-2xl font-bold">Page introuvable</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  )
}
