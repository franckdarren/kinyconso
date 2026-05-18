'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  Users,
  X,
} from 'lucide-react'

import { signOut } from '@/features/auth/actions/sign-out'
import { cn } from '@/lib/utils/cn'
import type { CurrentUserProfile } from '@/features/auth/queries/get-current-user'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
      { href: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
      { href: '/admin/produits', label: 'Produits', icon: Package },
      { href: '/admin/categories', label: 'Catégories', icon: Tag },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { href: '/admin/clients', label: 'Clients', icon: Users },
      { href: '/admin/livraisons', label: 'Livraisons', icon: Truck },
    ],
  },
  {
    label: 'Système',
    items: [{ href: '/admin/health', label: 'État des services', icon: Activity }],
  },
]

interface AdminSidebarProps {
  user: CurrentUserProfile
  isOpen: boolean
  onClose: () => void
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  return (email?.[0] ?? 'A').toUpperCase()
}

export function AdminSidebar({ user, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const content = (
    <aside className="border-border bg-card flex h-full w-64 flex-col border-r">
      {/* Logo */}
      <div className="border-border flex h-16 shrink-0 items-center gap-3 border-b px-5">
        <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold select-none">
          K
        </div>
        <div>
          <p className="text-sm leading-none font-semibold tracking-tight">KinyConso</p>
          <p className="text-muted-foreground mt-0.5 text-[11px]">Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-muted-foreground/70 mb-1.5 px-3 text-[10px] font-semibold tracking-widest uppercase">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            active
                              ? 'text-primary'
                              : 'text-muted-foreground group-hover:text-foreground',
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-border shrink-0 border-t">
        {/* Boutique */}
        <div className="px-3 py-2">
          <Link
            href="/"
            onClick={onClose}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <Store className="h-4 w-4 shrink-0" />
            Voir la boutique
          </Link>
        </div>

        {/* Profil */}
        <div className="border-border border-t px-3 py-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold select-none">
              {getInitials(user.fullName, user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-none font-medium">
                {user.fullName ?? user.email ?? 'Admin'}
              </p>
              <p className="text-muted-foreground mt-0.5 truncate text-[11px]">Administrateur</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                title="Se déconnecter"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md p-1.5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer mobile */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={onClose}
          aria-label="Fermer le menu"
          className="text-muted-foreground hover:bg-accent absolute top-3 right-3 z-10 rounded-md p-1.5 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {content}
      </div>

      {/* Sidebar desktop */}
      <div className="hidden shrink-0 md:flex">{content}</div>
    </>
  )
}
