'use server'

import { inArray, isNull, and } from 'drizzle-orm'

import { db } from '@/db'
import { products } from '@/db/schema'

export interface ProductSnapshot {
  id: string
  slug: string
  name: string
  price: number
  image: string | null
  stockQuantity: number
  isActive: boolean
}

/**
 * Récupère l'état actuel d'une liste de produits (prix, stock, dispo).
 * Utilisé par le panier pour re-valider le contenu (prix changés, ruptures...).
 */
export async function getCartProductSnapshots(
  productIds: string[],
): Promise<Record<string, ProductSnapshot>> {
  if (productIds.length === 0) return {}

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      images: products.images,
      stockQuantity: products.stockQuantity,
      isActive: products.isActive,
    })
    .from(products)
    .where(and(inArray(products.id, productIds), isNull(products.deletedAt)))

  const result: Record<string, ProductSnapshot> = {}
  for (const row of rows) {
    result[row.id] = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      price: row.price,
      image: row.images?.[0] ?? null,
      stockQuantity: row.stockQuantity,
      isActive: row.isActive,
    }
  }
  return result
}
