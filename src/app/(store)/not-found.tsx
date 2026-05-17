import Link from 'next/link'
import { PackageSearch } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function StoreNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-muted rounded-full p-6">
        <PackageSearch className="text-muted-foreground h-12 w-12" />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-7xl font-bold">404</p>
        <h2 className="text-2xl font-bold">Page introuvable</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          La page que vous recherchez n&apos;existe pas ou a &eacute;t&eacute;
          d&eacute;plac&eacute;e.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/produits">Voir les produits</Link>
        </Button>
        <Button asChild>
          <Link href="/">Accueil</Link>
        </Button>
      </div>
    </div>
  )
}
