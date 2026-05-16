import Link from 'next/link'
import { ShoppingBag, Sparkles, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
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

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-16 sm:grid-cols-3 sm:px-6">
        <FeatureCard
          icon={<ShoppingBag className="text-primary h-5 w-5" />}
          title="Catalogue varié"
          description="Une sélection de produits de qualité, mise à jour régulièrement."
        />
        <FeatureCard
          icon={<Truck className="text-primary h-5 w-5" />}
          title="Livraison rapide"
          description="Options de livraison configurables et délais clairs au moment du paiement."
        />
        <FeatureCard
          icon={<Sparkles className="text-primary h-5 w-5" />}
          title="Paiement sécurisé"
          description="Mobile Money et carte bancaire via PVIT. Pas de stockage de données sensibles."
        />
      </section>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
      <div className="bg-primary/10 inline-flex h-10 w-10 items-center justify-center rounded-md">
        {icon}
      </div>
      <h2 className="text-card-foreground mt-4 text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  )
}
