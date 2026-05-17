import Link from 'next/link'
import { ShoppingBag, Sparkles, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CategoryCard } from '@/features/categories/components/category-card'
import { ProductGrid } from '@/features/products/components/product-grid'
import { getActiveCategories } from '@/features/categories/queries'
import { getFeaturedProducts } from '@/features/products/queries'
import { siteConfig } from '@/config/site'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(8).catch(() => []),
    getActiveCategories().catch(() => []),
  ])

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="border-border bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <Sparkles className="text-primary h-3.5 w-3.5" />
            Bienvenue sur {siteConfig.name}
          </p>
          <h1 className="text-foreground mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            La boutique en ligne nouvelle génération au Gabon
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Payez en toute simplicité avec Airtel Money, Moov Money ou par carte bancaire. Livraison
            rapide partout à Libreville et au-delà.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/produits">Découvrir les produits</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/categories">Voir les catégories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-12 sm:grid-cols-3 sm:px-6">
        <Feature
          icon={<ShoppingBag className="text-primary h-5 w-5" />}
          title="Catalogue varié"
          description="Une sélection mise à jour régulièrement."
        />
        <Feature
          icon={<Truck className="text-primary h-5 w-5" />}
          title="Livraison rapide"
          description="Options claires et délais affichés au paiement."
        />
        <Feature
          icon={<Sparkles className="text-primary h-5 w-5" />}
          title="Paiement sécurisé"
          description="Mobile Money et carte bancaire via PVIT."
        />
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Catégories</h2>
            <Link href="/categories" className="text-primary text-sm font-medium hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {/* Produits vedette */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Nos coups de cœur</h2>
          <Link href="/produits" className="text-primary text-sm font-medium hover:underline">
            Tout voir
          </Link>
        </div>
        <ProductGrid
          products={featured}
          emptyLabel="Aucun produit en vedette pour le moment."
          prioritizeFirst
        />
      </section>
    </div>
  )
}

interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="bg-card border-border rounded-lg border p-5 shadow-sm">
      <div className="bg-primary/10 inline-flex h-10 w-10 items-center justify-center rounded-md">
        {icon}
      </div>
      <h3 className="text-card-foreground mt-4 text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  )
}
