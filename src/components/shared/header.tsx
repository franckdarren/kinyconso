import Link from 'next/link'

import { UserMenu } from '@/components/shared/user-menu'
import { MobileMenu } from '@/components/shared/mobile-menu'
import { CartBadge } from '@/features/cart/components/cart-badge'
import { NotificationCenterServer } from '@/features/notifications/components/notification-center-server'
import { getRootActiveCategories } from '@/features/categories/queries'
import { siteConfig } from '@/config/site'

export async function Header() {
  let cats: Awaited<ReturnType<typeof getRootActiveCategories>> = []
  try {
    cats = await getRootActiveCategories()
  } catch {
    // pas bloquant si la DB est indisponible
  }

  const navCats = cats.slice(0, 5)

  return (
    <header className="border-border bg-background sticky top-0 z-40 w-full border-b">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="text-primary text-base">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link
            href="/produits"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Produits
          </Link>
          <Link
            href="/categories"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Catégories
          </Link>
          {navCats.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <NotificationCenterServer />
          <UserMenu />
          <CartBadge />
          <MobileMenu categories={navCats} />
        </div>
      </div>
    </header>
  )
}
