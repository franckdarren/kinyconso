import { describe, expect, it } from 'vitest'

import { createProductSchema, normalizeProductInput, productFiltersSchema } from '../product.schema'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

const validProduct = {
  name: 'Téléphone Samsung',
  price: 150000,
  categoryId: VALID_UUID,
}

describe('createProductSchema', () => {
  it('valide un produit minimal', () => {
    expect(createProductSchema.safeParse(validProduct).success).toBe(true)
  })

  it('valide un produit complet', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      slug: 'telephone-samsung',
      description: 'Un bon téléphone',
      compareAtPrice: 180000,
      stockQuantity: 10,
      images: ['https://example.com/img.jpg'],
      isActive: true,
      isFeatured: false,
      weight: 200,
    })
    expect(result.success).toBe(true)
  })

  it('rejette un nom trop court (< 2 caractères)', () => {
    const result = createProductSchema.safeParse({ ...validProduct, name: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejette un prix non entier', () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: 1500.5 })
    expect(result.success).toBe(false)
  })

  it('rejette un prix nul ou négatif', () => {
    expect(createProductSchema.safeParse({ ...validProduct, price: 0 }).success).toBe(false)
    expect(createProductSchema.safeParse({ ...validProduct, price: -100 }).success).toBe(false)
  })

  it('rejette si compareAtPrice <= price', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      compareAtPrice: 150000,
    })
    expect(result.success).toBe(false)
  })

  it('accepte compareAtPrice > price', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      compareAtPrice: 200000,
    })
    expect(result.success).toBe(true)
  })

  it('accepte compareAtPrice null', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      compareAtPrice: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejette un categoryId non UUID', () => {
    const result = createProductSchema.safeParse({ ...validProduct, categoryId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejette plus de 8 images', () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      images: Array(9).fill('https://example.com/img.jpg'),
    })
    expect(result.success).toBe(false)
  })

  it('rejette un slug avec majuscules', () => {
    const result = createProductSchema.safeParse({ ...validProduct, slug: 'Produit-Test' })
    expect(result.success).toBe(false)
  })

  it('accepte un slug vide (sera auto-généré)', () => {
    const result = createProductSchema.safeParse({ ...validProduct, slug: '' })
    expect(result.success).toBe(true)
  })
})

describe('productFiltersSchema', () => {
  it('utilise les valeurs par défaut', () => {
    const result = productFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data?.sort).toBe('recent')
    expect(result.data?.page).toBe(1)
    expect(result.data?.pageSize).toBe(24)
  })

  it('valide avec tous les filtres', () => {
    const result = productFiltersSchema.safeParse({
      search: 'samsung',
      categoryId: VALID_UUID,
      minPrice: 0,
      maxPrice: 500000,
      isActive: true,
      sort: 'price_asc',
      page: 2,
      pageSize: 12,
    })
    expect(result.success).toBe(true)
  })

  it('rejette un sort invalide', () => {
    expect(productFiltersSchema.safeParse({ sort: 'invalid_sort' }).success).toBe(false)
  })

  it('rejette une page < 1', () => {
    expect(productFiltersSchema.safeParse({ page: 0 }).success).toBe(false)
  })

  it('rejette un pageSize > 60', () => {
    expect(productFiltersSchema.safeParse({ pageSize: 61 }).success).toBe(false)
  })
})

describe('normalizeProductInput', () => {
  it('génère un slug à partir du nom si slug vide', () => {
    const result = normalizeProductInput({ ...validProduct, slug: '' })
    expect(result.slug).toBe('telephone-samsung')
  })

  it('conserve le slug fourni', () => {
    const result = normalizeProductInput({ ...validProduct, slug: 'mon-slug-custom' })
    expect(result.slug).toBe('mon-slug-custom')
  })

  it('initialise stockQuantity à 0 par défaut', () => {
    const result = normalizeProductInput(validProduct)
    expect(result.stockQuantity).toBe(0)
  })

  it('initialise isActive à true par défaut', () => {
    expect(normalizeProductInput(validProduct).isActive).toBe(true)
  })

  it('initialise isFeatured à false par défaut', () => {
    expect(normalizeProductInput(validProduct).isFeatured).toBe(false)
  })

  it('trim le nom et le slug', () => {
    const result = normalizeProductInput({
      ...validProduct,
      name: '  Produit  ',
      slug: '  mon-slug  ',
    })
    expect(result.name).toBe('Produit')
    expect(result.slug).toBe('mon-slug')
  })

  it('initialise images à [] par défaut', () => {
    expect(normalizeProductInput(validProduct).images).toEqual([])
  })

  it('met compareAtPrice à null si absent', () => {
    expect(normalizeProductInput(validProduct).compareAtPrice).toBeNull()
  })
})
