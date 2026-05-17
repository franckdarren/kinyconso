import 'server-only'

import { cache } from 'react'
import { and, asc, count, desc, eq, gte, ilike, isNull, lte, or, sql, type SQL } from 'drizzle-orm'

import { db } from '@/db'
import { categories, products } from '@/db/schema'

import type { ProductFilters } from '../schemas/product.schema'

export type ProductListItem = Awaited<ReturnType<typeof getProducts>>['rows'][number]

interface GetProductsInternal extends Partial<ProductFilters> {
  /** Inclure ou non les produits supprimés (par défaut : false) */
  includeDeleted?: boolean
  /** Forcer la lecture des produits inactifs (par défaut : false côté vitrine) */
  includeInactive?: boolean
}

export async function getProducts(filters: GetProductsInternal = {}) {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 24
  const offset = (page - 1) * pageSize

  const conditions: SQL[] = []

  if (!filters.includeDeleted) {
    conditions.push(isNull(products.deletedAt))
  }
  if (!filters.includeInactive && filters.isActive === undefined) {
    conditions.push(eq(products.isActive, true))
  }
  if (filters.isActive !== undefined) {
    conditions.push(eq(products.isActive, filters.isActive))
  }
  if (filters.isFeatured !== undefined) {
    conditions.push(eq(products.isFeatured, filters.isFeatured))
  }
  if (filters.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId))
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice))
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice))
  }
  if (filters.search) {
    const term = `%${filters.search}%`
    const clause = or(ilike(products.name, term), ilike(products.description, term))
    if (clause) conditions.push(clause)
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const orderBy =
    filters.sort === 'price_asc'
      ? asc(products.price)
      : filters.sort === 'price_desc'
        ? desc(products.price)
        : filters.sort === 'name_asc'
          ? asc(products.name)
          : desc(products.createdAt)

  const rowsQuery = db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stockQuantity: products.stockQuantity,
      images: products.images,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset)

  const countQuery = db.select({ value: count() }).from(products)

  const [rows, [{ value: total } = { value: 0 }]] = await Promise.all([
    whereClause ? rowsQuery.where(whereClause) : rowsQuery,
    whereClause ? countQuery.where(whereClause) : countQuery,
  ])

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export const getProductBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      stockQuantity: products.stockQuantity,
      images: products.images,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      weight: products.weight,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), isNull(products.deletedAt)))
    .limit(1)
  return row ?? null
})

export const getProductById = cache(async (id: string) => {
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1)
  return row ?? null
})

export async function getFeaturedProducts(limit = 8) {
  const result = await getProducts({ isFeatured: true, pageSize: limit })
  return result.rows
}

export async function getProductsByCategory(categoryId: string, limit = 12) {
  const result = await getProducts({ categoryId, pageSize: limit })
  return result.rows
}

export async function getAdjacentProductSlugs(productId: string) {
  // Helper futur (navigation produit précédent/suivant) — utilise sql<string> pour shape souple
  const rows = await db.execute<{ slug: string }>(
    sql`select slug from public.products where id <> ${productId} and deleted_at is null order by random() limit 4`,
  )
  return rows.map((r) => r.slug)
}
