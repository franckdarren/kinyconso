import { describe, expect, it } from 'vitest'

import { addressStepSchema, deliveryStepSchema, paymentStepSchema } from '../checkout.schema'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('addressStepSchema', () => {
  const validAddress = {
    fullName: 'Jean Dupont',
    phone: '066000000',
    address: '12 Rue de la Paix, Quartier Louis',
    city: 'Libreville',
  }

  it('valide une adresse complete', () => {
    expect(addressStepSchema.safeParse(validAddress).success).toBe(true)
  })

  it('valide avec notes optionnelles', () => {
    expect(
      addressStepSchema.safeParse({ ...validAddress, notes: 'Code portail : 1234' }).success,
    ).toBe(true)
  })

  it('rejette un nom trop court', () => {
    expect(addressStepSchema.safeParse({ ...validAddress, fullName: 'A' }).success).toBe(false)
  })

  it('rejette un telephone trop court', () => {
    expect(addressStepSchema.safeParse({ ...validAddress, phone: '123' }).success).toBe(false)
  })

  it('rejette un telephone avec lettres', () => {
    expect(addressStepSchema.safeParse({ ...validAddress, phone: 'abc12345' }).success).toBe(false)
  })

  it('accepte un telephone international', () => {
    expect(addressStepSchema.safeParse({ ...validAddress, phone: '+24166000000' }).success).toBe(
      true,
    )
  })

  it('rejette une adresse trop courte', () => {
    expect(addressStepSchema.safeParse({ ...validAddress, address: 'Rue' }).success).toBe(false)
  })

  it('rejette une ville trop courte', () => {
    expect(addressStepSchema.safeParse({ ...validAddress, city: 'A' }).success).toBe(false)
  })

  it('accepte notes vides', () => {
    expect(addressStepSchema.safeParse({ ...validAddress, notes: '' }).success).toBe(true)
  })
})

describe('deliveryStepSchema', () => {
  it('valide un UUID de livraison', () => {
    expect(deliveryStepSchema.safeParse({ deliveryOptionId: VALID_UUID }).success).toBe(true)
  })

  it('rejette un id non UUID', () => {
    expect(deliveryStepSchema.safeParse({ deliveryOptionId: 'not-uuid' }).success).toBe(false)
  })

  it('rejette un champ manquant', () => {
    expect(deliveryStepSchema.safeParse({}).success).toBe(false)
  })
})

describe('paymentStepSchema', () => {
  it('valide Airtel Money avec numero', () => {
    expect(
      paymentStepSchema.safeParse({ operator: 'AIRTEL_MONEY', customerPhone: '066000000' }).success,
    ).toBe(true)
  })

  it('valide Moov Money', () => {
    expect(
      paymentStepSchema.safeParse({ operator: 'MOOV_MONEY', customerPhone: '062000000' }).success,
    ).toBe(true)
  })

  it('valide Visa/Mastercard', () => {
    expect(
      paymentStepSchema.safeParse({ operator: 'VISA_MASTERCARD', customerPhone: '066000000' })
        .success,
    ).toBe(true)
  })

  it('rejette un operateur inconnu', () => {
    expect(
      paymentStepSchema.safeParse({ operator: 'ORANGE_MONEY', customerPhone: '066000000' }).success,
    ).toBe(false)
  })

  it('rejette un numero trop court', () => {
    expect(
      paymentStepSchema.safeParse({ operator: 'AIRTEL_MONEY', customerPhone: '1234' }).success,
    ).toBe(false)
  })

  it('rejette un numero avec lettres', () => {
    expect(
      paymentStepSchema.safeParse({ operator: 'AIRTEL_MONEY', customerPhone: 'abcdefgh' }).success,
    ).toBe(false)
  })
})
