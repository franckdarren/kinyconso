import type { MetadataRoute } from 'next'

import { getActiveCategories } from '@/features/categories/queries'
import { getProducts } from '@/features/products/queries'
import { siteConfig } from '@/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, productsResult] = await Promise.all([
    getActiveCategories().catch(() => []),
    getProducts({ pageSize: 5000 }).catch(() => ({ rows: [] })),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteConfig.url}/produits`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteConfig.url}/categories/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const productPages: MetadataRoute.Sitemap = productsResult.rows.map((p) => ({
    url: `${siteConfig.url}/produits/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
