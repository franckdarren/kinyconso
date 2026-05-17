'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight, ShoppingBag, Grid3X3 } from 'lucide-react'

type NavCategory = { id: string; name: string; slug: string }

export function MobileMenu({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = useState(pathname)

  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-40 bg-black/10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="border-border absolute right-0 left-0 z-50 border-b bg-white shadow-md">
            <nav className="divide-border mx-auto max-w-6xl divide-y px-4">
              <Link
                href="/produits"
                className="text-foreground flex items-center justify-between py-3.5 text-sm font-medium"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag size={16} className="text-primary" />
                  Produits
                </span>
                <ChevronRight size={15} className="text-muted-foreground" />
              </Link>

              <Link
                href="/categories"
                className="text-foreground flex items-center justify-between py-3.5 text-sm font-medium"
              >
                <span className="flex items-center gap-3">
                  <Grid3X3 size={16} className="text-primary" />
                  Catégories
                </span>
                <ChevronRight size={15} className="text-muted-foreground" />
              </Link>

              {categories.length > 0 && (
                <div className="py-2">
                  <p className="text-muted-foreground px-0 pt-1 pb-1.5 text-xs font-semibold tracking-wider uppercase">
                    Parcourir
                  </p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className="text-muted-foreground hover:text-foreground flex items-center justify-between py-2.5 pl-2 text-sm"
                    >
                      {cat.name}
                      <ChevronRight size={14} className="text-muted-foreground/60" />
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
