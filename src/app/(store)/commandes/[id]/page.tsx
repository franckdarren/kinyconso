import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import { OrderDetail } from '@/features/orders/components/order-detail'
import { getOrderById } from '@/features/orders/queries'

export const metadata: Metadata = {
  title: 'Ma commande',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerOrderPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/auth/connexion?redirectTo=/commandes/${id}`)
  }

  const order = await getOrderById(id)
  if (!order) notFound()
  if (order.userId !== user.id && user.role !== 'admin') {
    redirect('/compte/commandes')
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <nav className="mb-4 text-sm">
        <Link href="/compte/commandes" className="text-muted-foreground hover:text-foreground">
          ← Mes commandes
        </Link>
      </nav>

      <OrderDetail order={order} />

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="ghost">
          <Link href="/produits">Continuer mes achats</Link>
        </Button>
      </div>
    </div>
  )
}
