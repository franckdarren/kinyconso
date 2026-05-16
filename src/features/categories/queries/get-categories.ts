import 'server-only'

import { cache } from 'react'
import { asc, eq, isNull } from 'drizzle-orm'

import { db } from '@/db'
import { categories } from '@/db/schema'

export const getCategories = cache(async () => {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name))
})

export const getActiveCategories = cache(async () => {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name))
})

export const getRootActiveCategories = cache(async () => {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name))
    .then((rows) => rows.filter((c) => c.parentId === null))
})

export const getCategoryBySlug = cache(async (slug: string) => {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1)
  return row ?? null
})

export const getCategoryById = cache(async (id: string) => {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
  return row ?? null
})

export const getOrphanCategories = cache(async () => {
  return db
    .select()
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(asc(categories.sortOrder), asc(categories.name))
})
