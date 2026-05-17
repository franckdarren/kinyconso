import 'server-only'

import { and, asc, eq, isNull, lte } from 'drizzle-orm'

import { db } from '@/db'
import { products } from '@/db/schema'

export const LOW_STOCK_THRESHOLD = 5

export interface LowStockRow {
  id: string
  name: string
  slug: string
  stockQuantity: number
  image: string | null
}

export async function getLowStockProducts(limit = 10): Promise<LowStockRow[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      stockQuantity: products.stockQuantity,
      images: products.images,
    })
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        isNull(products.deletedAt),
        lte(products.stockQuantity, LOW_STOCK_THRESHOLD),
      ),
    )
    .orderBy(asc(products.stockQuantity), asc(products.name))
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    stockQuantity: r.stockQuantity,
    image: r.images[0] ?? null,
  }))
}
