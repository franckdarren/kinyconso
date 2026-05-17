import { describe, expect, it } from 'vitest'

import {
  createCategorySchema,
  normalizeCategoryInput,
  updateCategorySchema,
} from '../category.schema'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('createCategorySchema', () => {
  const validCategory = { name: 'Alimentation' }

  it('valide une categorie minimale', () => {
    expect(createCategorySchema.safeParse(validCategory).success).toBe(true)
  })

  it('valide une categorie complete', () => {
    const result = createCategorySchema.safeParse({
      name: 'Electronique',
      slug: 'electronique',
      description: 'Produits electroniques',
      imageUrl: 'https://example.com/img.jpg',
      parentId: VALID_UUID,
      isActive: true,
      sortOrder: 1,
    })
    expect(result.success).toBe(true)
  })

  it('rejette un nom trop court', () => {
    expect(createCategorySchema.safeParse({ name: 'A' }).success).toBe(false)
  })

  it('rejette un nom trop long', () => {
    expect(createCategorySchema.safeParse({ name: 'A'.repeat(121) }).success).toBe(false)
  })

  it('rejette un slug avec majuscules', () => {
    const result = createCategorySchema.safeParse({ name: 'Test', slug: 'Test-Slug' })
    expect(result.success).toBe(false)
  })

  it('accepte un slug vide (auto-genere)', () => {
    expect(createCategorySchema.safeParse({ name: 'Test', slug: '' }).success).toBe(true)
  })

  it('rejette une URL d image invalide', () => {
    const result = createCategorySchema.safeParse({ name: 'Test', imageUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('accepte imageUrl vide', () => {
    expect(createCategorySchema.safeParse({ name: 'Test', imageUrl: '' }).success).toBe(true)
  })

  it('rejette un parentId non UUID', () => {
    expect(createCategorySchema.safeParse({ name: 'Test', parentId: 'not-uuid' }).success).toBe(
      false,
    )
  })

  it('accepte parentId null', () => {
    expect(createCategorySchema.safeParse({ name: 'Test', parentId: null }).success).toBe(true)
  })
})

describe('updateCategorySchema', () => {
  it('valide avec un id UUID valide', () => {
    const result = updateCategorySchema.safeParse({ id: VALID_UUID, name: 'Electronique' })
    expect(result.success).toBe(true)
  })

  it('rejette sans id', () => {
    expect(updateCategorySchema.safeParse({ name: 'Test' }).success).toBe(false)
  })

  it('rejette un id non UUID', () => {
    expect(updateCategorySchema.safeParse({ id: 'not-uuid', name: 'Test' }).success).toBe(false)
  })
})

describe('normalizeCategoryInput', () => {
  it('genere un slug depuis le nom si slug absent', () => {
    const result = normalizeCategoryInput({ name: 'Alimentation & Boissons', slug: '' })
    expect(result.slug).toBe('alimentation-boissons')
  })

  it('conserve le slug fourni', () => {
    const result = normalizeCategoryInput({ name: 'Test', slug: 'mon-slug' })
    expect(result.slug).toBe('mon-slug')
  })

  it('initialise isActive a true par defaut', () => {
    expect(normalizeCategoryInput({ name: 'Test' }).isActive).toBe(true)
  })

  it('initialise sortOrder a 0 par defaut', () => {
    expect(normalizeCategoryInput({ name: 'Test' }).sortOrder).toBe(0)
  })

  it('met description a null si absente', () => {
    expect(normalizeCategoryInput({ name: 'Test' }).description).toBeNull()
  })

  it('met imageUrl a null si absente', () => {
    expect(normalizeCategoryInput({ name: 'Test' }).imageUrl).toBeNull()
  })

  it('trim le nom', () => {
    expect(normalizeCategoryInput({ name: '  Electronique  ' }).name).toBe('Electronique')
  })
})
