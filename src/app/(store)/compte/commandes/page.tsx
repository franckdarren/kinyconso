import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { OrderList } from '@/features/orders/components/order-list'
import { getUserOrders } from '@/features/orders/queries'

export const metadata: Metadata = {
  title: 'Mes commandes',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/connexion?redirectTo=/compte/commandes')
  }

  const orders = await getUserOrders(user.id)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mes commandes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Historique de vos commandes et statut de livraison.
        </p>
      </header>

      <OrderList
        rows={orders}
        basePath="/commandes"
        emptyLabel="Vous n’avez encore passé aucune commande."
      />
    </div>
  )
}
