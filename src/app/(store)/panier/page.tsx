import type { Metadata } from 'next'

import { CartPageClient } from './cart-page-client'

export const metadata: Metadata = {
  title: 'Mon panier',
  description: 'Consultez et modifiez les articles de votre panier KinyConso.',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Mon panier</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Vérifiez les articles avant de passer commande.
      </p>

      <div className="mt-8">
        <CartPageClient />
      </div>
    </div>
  )
}
