import { describe, expect, it } from 'vitest'

import {
  createDeliveryOptionSchema,
  normalizeDeliveryOptionInput,
  updateDeliveryOptionSchema,
} from '../delivery.schema'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('createDeliveryOptionSchema', () => {
  const validOption = { name: 'Livraison standard', price: 2000 }

  it('valide une option minimale', () => {
    expect(createDeliveryOptionSchema.safeParse(validOption).success).toBe(true)
  })

  it('valide une option complete', () => {
    const result = createDeliveryOptionSchema.safeParse({
      name: 'Livraison express',
      description: 'Livraison en 24h',
      price: 5000,
      estimatedDays: 1,
      isActive: true,
      sortOrder: 0,
    })
    expect(result.success).toBe(true)
  })

  it('accepte un prix a zero (gratuit)', () => {
    expect(createDeliveryOptionSchema.safeParse({ ...validOption, price: 0 }).success).toBe(true)
  })

  it('rejette un prix negatif', () => {
    expect(createDeliveryOptionSchema.safeParse({ ...validOption, price: -100 }).success).toBe(
      false,
    )
  })

  it('rejette un prix non entier', () => {
    expect(createDeliveryOptionSchema.safeParse({ ...validOption, price: 1500.5 }).success).toBe(
      false,
    )
  })

  it('rejette un nom trop court', () => {
    expect(createDeliveryOptionSchema.safeParse({ name: 'A', price: 0 }).success).toBe(false)
  })

  it('rejette un nom trop long', () => {
    expect(createDeliveryOptionSchema.safeParse({ name: 'A'.repeat(121), price: 0 }).success).toBe(
      false,
    )
  })

  it('rejette un estimatedDays negatif', () => {
    expect(
      createDeliveryOptionSchema.safeParse({ ...validOption, estimatedDays: -1 }).success,
    ).toBe(false)
  })

  it('accepte estimatedDays null', () => {
    expect(
      createDeliveryOptionSchema.safeParse({ ...validOption, estimatedDays: null }).success,
    ).toBe(true)
  })

  it('accepte description vide', () => {
    expect(createDeliveryOptionSchema.safeParse({ ...validOption, description: '' }).success).toBe(
      true,
    )
  })
})

describe('updateDeliveryOptionSchema', () => {
  it('valide avec un id UUID valide', () => {
    const result = updateDeliveryOptionSchema.safeParse({
      id: VALID_UUID,
      name: 'Livraison',
      price: 1000,
    })
    expect(result.success).toBe(true)
  })

  it('rejette sans id', () => {
    expect(updateDeliveryOptionSchema.safeParse({ name: 'Test', price: 0 }).success).toBe(false)
  })
})

describe('normalizeDeliveryOptionInput', () => {
  it('trim le nom', () => {
    expect(normalizeDeliveryOptionInput({ name: '  Livraison  ', price: 1000 }).name).toBe(
      'Livraison',
    )
  })

  it('initialise isActive a true par defaut', () => {
    expect(normalizeDeliveryOptionInput({ name: 'Test', price: 0 }).isActive).toBe(true)
  })

  it('initialise sortOrder a 0 par defaut', () => {
    expect(normalizeDeliveryOptionInput({ name: 'Test', price: 0 }).sortOrder).toBe(0)
  })

  it('met description a null si absente', () => {
    expect(normalizeDeliveryOptionInput({ name: 'Test', price: 0 }).description).toBeNull()
  })

  it('met estimatedDays a null si absent', () => {
    expect(normalizeDeliveryOptionInput({ name: 'Test', price: 0 }).estimatedDays).toBeNull()
  })

  it('conserve estimatedDays fourni', () => {
    expect(
      normalizeDeliveryOptionInput({ name: 'Test', price: 0, estimatedDays: 3 }).estimatedDays,
    ).toBe(3)
  })

  it('met estimatedDays a null si null explicite', () => {
    expect(
      normalizeDeliveryOptionInput({ name: 'Test', price: 0, estimatedDays: null }).estimatedDays,
    ).toBeNull()
  })
})
