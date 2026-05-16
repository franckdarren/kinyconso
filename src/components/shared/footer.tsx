import Link from 'next/link'

import { siteConfig } from '@/config/site'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-border bg-muted/40 mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-primary text-lg font-semibold">{siteConfig.name}</p>
          <p className="text-muted-foreground mt-2 text-sm">{siteConfig.description}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Boutique</p>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
            <li>
              <Link href="/produits" className="hover:text-foreground">
                Produits
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-foreground">
                Catégories
              </Link>
            </li>
            <li>
              <Link href="/panier" className="hover:text-foreground">
                Panier
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Compte</p>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
            <li>
              <Link href="/auth/connexion" className="hover:text-foreground">
                Connexion
              </Link>
            </li>
            <li>
              <Link href="/auth/inscription" className="hover:text-foreground">
                Inscription
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-border text-muted-foreground border-t py-4 text-center text-xs">
        © {year} {siteConfig.name}. Tous droits réservés.
      </div>
    </footer>
  )
}
