'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface AdminTopbarProps {
  onMenuClick: () => void
}

const PAGE_TITLES: Array<[string, string, boolean]> = [
  ['/admin', 'Tableau de bord', true],
  ['/admin/commandes', 'Commandes', false],
  ['/admin/produits', 'Produits', false],
  ['/admin/categories', 'Catégories', false],
  ['/admin/clients', 'Clients', false],
  ['/admin/livraisons', 'Livraisons', false],
  ['/admin/health', 'État des services', false],
]

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname()

  const title =
    PAGE_TITLES.find(([href, , exact]) =>
      exact ? pathname === href : pathname === href || pathname.startsWith(href + '/'),
    )?.[1] ?? 'Administration'

  return (
    <header className="border-border bg-card flex h-14 shrink-0 items-center gap-3 border-b px-4 md:hidden">
      <button
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1.5 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold">{title}</span>
    </header>
  )
}
