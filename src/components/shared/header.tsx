import Link from 'next/link'

import { UserMenu } from '@/components/shared/user-menu'
import { CategoryNav } from '@/features/categories/components/category-nav'
import { CartBadge } from '@/features/cart/components/cart-badge'
import { siteConfig } from '@/config/site'

export function Header() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-primary text-lg">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/produits" className="text-muted-foreground hover:text-foreground">
            Produits
          </Link>
          <Link href="/categories" className="text-muted-foreground hover:text-foreground">
            Catégories
          </Link>
          <CategoryNav />
        </nav>

        <div className="flex items-center gap-1">
          <UserMenu />
          <CartBadge />
        </div>
      </div>
    </header>
  )
}
