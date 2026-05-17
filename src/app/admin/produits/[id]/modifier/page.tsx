import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProductForm } from '@/features/products/components/product-form'
import { getActiveCategories, getCategories } from '@/features/categories/queries'
import { getProductById } from '@/features/products/queries'

export const metadata: Metadata = {
  title: 'Modifier le produit',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) notFound()

  // On inclut aussi les catégories inactives au cas où le produit en aurait une.
  const [active, all] = await Promise.all([getActiveCategories(), getCategories()])
  const seen = new Set<string>()
  const merged = [...active, ...all].filter((c) => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Modifier le produit</h1>
        <p className="text-muted-foreground text-sm">{product.name}</p>
      </header>

      <ProductForm categories={merged.map((c) => ({ id: c.id, name: c.name }))} initial={product} />
    </div>
  )
}
