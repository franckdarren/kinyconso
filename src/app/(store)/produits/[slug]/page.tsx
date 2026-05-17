import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductCard } from '@/features/products/components/product-card'
import { ProductDetail } from '@/features/products/components/product-detail'
import { getProductBySlug, getProductsByCategory } from '@/features/products/queries'
import { formatPrice } from '@/lib/utils/format-price'
import { siteConfig } from '@/config/site'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)

  if (!product) {
    return { title: 'Produit introuvable' }
  }

  const description =
    product.description?.slice(0, 160) ??
    `${product.name} — ${formatPrice(product.price)}. Disponible sur ${siteConfig.name}.`
  const ogImage = product.images?.[0]

  return {
    title: product.name,
    description,
    alternates: { canonical: `/produits/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      url: `${siteConfig.url}/produits/${product.slug}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 1200, alt: product.name }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)

  if (!product || !product.isActive) notFound()

  const related = await getProductsByCategory(product.categoryId, 5)
    .then((rows) => rows.filter((r) => r.slug !== product.slug).slice(0, 4))
    .catch(() => [])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.images,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XAF',
      price: product.price,
      availability:
        product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${siteConfig.url}/produits/${product.slug}`,
    },
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <nav className="text-muted-foreground mb-6 text-sm">
        <Link href="/" className="hover:text-foreground">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <Link href="/produits" className="hover:text-foreground">
          Produits
        </Link>
        {product.categorySlug && product.categoryName && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/categories/${product.categorySlug}`} className="hover:text-foreground">
              {product.categoryName}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-semibold">Vous aimerez aussi</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
