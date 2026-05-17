import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, LayoutDashboard, Package, ShoppingBag, Tag, Truck, Users } from 'lucide-react'

import { getCurrentUser } from '@/features/auth/queries/get-current-user'

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/produits', label: 'Produits', icon: Package },
  { href: '/admin/categories', label: 'Catégories', icon: Tag },
  { href: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { href: '/admin/livraisons', label: 'Livraisons', icon: Truck },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/health', label: 'État des services', icon: Activity },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/connexion?redirectTo=/admin')
  }
  if (user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="bg-card border-border sticky top-20 flex flex-col gap-1 rounded-lg border p-3 shadow-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
