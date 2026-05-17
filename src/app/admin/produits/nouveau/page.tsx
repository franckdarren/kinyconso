import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ProductForm } from '@/features/products/components/product-form'
import { getActiveCategories } from '@/features/categories/queries'

export const metadata: Metadata = {
  title: 'Nouveau produit',
}

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const categories = await getActiveCategories()

  if (categories.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Aucune catégorie active</h1>
        <p className="text-muted-foreground text-sm">
          Vous devez créer au moins une catégorie active avant d’ajouter un produit.
        </p>
        <Button asChild>
          <Link href="/admin/categories/nouvelle">Créer une catégorie</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau produit</h1>
        <p className="text-muted-foreground text-sm">
          Renseignez les détails du produit puis enregistrez.
        </p>
      </header>

      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  )
}
