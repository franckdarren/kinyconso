'use server'

import { revalidatePath } from 'next/cache'
import { eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { products } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

async function ensureAdmin(): Promise<{ success: false; error: string } | null> {
  try {
    await requireAdmin()
    return null
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }
}

export async function softDeleteProduct(id: string): Promise<ActionResult<void>> {
  const denied = await ensureAdmin()
  if (denied) return denied

  const [updated] = await db
    .update(products)
    .set({ deletedAt: new Date(), isActive: false })
    .where(eq(products.id, id))
    .returning({ id: products.id })

  if (!updated) {
    return { success: false, error: 'Produit introuvable' }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/produits')
  return { success: true, data: undefined }
}

export async function restoreProduct(id: string): Promise<ActionResult<void>> {
  const denied = await ensureAdmin()
  if (denied) return denied

  const [updated] = await db
    .update(products)
    .set({ deletedAt: null })
    .where(eq(products.id, id))
    .returning({ id: products.id })

  if (!updated) {
    return { success: false, error: 'Produit introuvable' }
  }

  revalidatePath('/admin/produits')
  return { success: true, data: undefined }
}

export async function toggleProductActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<void>> {
  const denied = await ensureAdmin()
  if (denied) return denied

  const [updated] = await db
    .update(products)
    .set({ isActive })
    .where(eq(products.id, id))
    .returning({ id: products.id })

  if (!updated) {
    return { success: false, error: 'Produit introuvable' }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/produits')
  return { success: true, data: undefined }
}

export async function toggleProductFeatured(
  id: string,
  isFeatured: boolean,
): Promise<ActionResult<void>> {
  const denied = await ensureAdmin()
  if (denied) return denied

  const [updated] = await db
    .update(products)
    .set({ isFeatured })
    .where(eq(products.id, id))
    .returning({ id: products.id })

  if (!updated) {
    return { success: false, error: 'Produit introuvable' }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function updateProductStock(
  id: string,
  delta: number,
): Promise<ActionResult<{ stockQuantity: number }>> {
  const denied = await ensureAdmin()
  if (denied) return denied

  const [updated] = await db
    .update(products)
    .set({ stockQuantity: sql`greatest(0, ${products.stockQuantity} + ${delta})` })
    .where(eq(products.id, id))
    .returning({ stockQuantity: products.stockQuantity })

  if (!updated) {
    return { success: false, error: 'Produit introuvable' }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/produits')
  return { success: true, data: { stockQuantity: updated.stockQuantity } }
}
