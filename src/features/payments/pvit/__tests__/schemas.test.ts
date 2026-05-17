import { describe, expect, it } from 'vitest'

import {
  checkStatusQuerySchema,
  initiatePaymentSchema,
  kycRequestSchema,
  pvitCallbackPayloadSchema,
} from '../schemas'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'

const validAddress = {
  fullName: 'Jean Dupont',
  phone: '066000000',
  address: '12 Rue de la Paix',
  city: 'Libreville',
}

describe('initiatePaymentSchema', () => {
  const validPayload = {
    items: [{ productId: VALID_UUID, quantity: 2 }],
    deliveryOptionId: VALID_UUID,
    operator: 'AIRTEL_MONEY' as const,
    deliveryAddress: validAddress,
  }

  it('valide un payload complet', () => {
    expect(initiatePaymentSchema.safeParse(validPayload).success).toBe(true)
  })

  it('rejette un panier vide', () => {
    const result = initiatePaymentSchema.safeParse({ ...validPayload, items: [] })
    expect(result.success).toBe(false)
  })

  it('rejette une quantité < 1', () => {
    const result = initiatePaymentSchema.safeParse({
      ...validPayload,
      items: [{ productId: VALID_UUID, quantity: 0 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejette un productId non UUID', () => {
    const result = initiatePaymentSchema.safeParse({
      ...validPayload,
      items: [{ productId: 'not-a-uuid', quantity: 1 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejette un opérateur inconnu', () => {
    const result = initiatePaymentSchema.safeParse({
      ...validPayload,
      operator: 'ORANGE_MONEY',
    })
    expect(result.success).toBe(false)
  })

  it('accepte tous les opérateurs valides', () => {
    const operators = ['AIRTEL_MONEY', 'MOOV_MONEY', 'VISA_MASTERCARD'] as const
    for (const operator of operators) {
      expect(initiatePaymentSchema.safeParse({ ...validPayload, operator }).success).toBe(true)
    }
  })

  it('rejette une adresse de livraison incomplète', () => {
    const result = initiatePaymentSchema.safeParse({
      ...validPayload,
      deliveryAddress: { fullName: 'Jean' },
    })
    expect(result.success).toBe(false)
  })

  it('rejette un numéro de téléphone avec lettres', () => {
    const result = initiatePaymentSchema.safeParse({
      ...validPayload,
      customerPhone: 'abcdefgh',
    })
    expect(result.success).toBe(false)
  })

  it('accepte customerPhone optionnel', () => {
    const { customerPhone: _, ...withoutPhone } = { ...validPayload, customerPhone: undefined }
    expect(initiatePaymentSchema.safeParse(withoutPhone).success).toBe(true)
  })
})

describe('checkStatusQuerySchema', () => {
  it('valide une référence UUID', () => {
    expect(checkStatusQuerySchema.safeParse({ reference: VALID_UUID }).success).toBe(true)
  })

  it('rejette une référence non UUID', () => {
    expect(checkStatusQuerySchema.safeParse({ reference: 'not-uuid' }).success).toBe(false)
  })

  it('rejette un champ manquant', () => {
    expect(checkStatusQuerySchema.safeParse({}).success).toBe(false)
  })
})

describe('kycRequestSchema', () => {
  it('valide un numéro Airtel Money', () => {
    expect(
      kycRequestSchema.safeParse({ phone: '066000000', operator: 'AIRTEL_MONEY' }).success,
    ).toBe(true)
  })

  it('rejette un numéro trop court', () => {
    expect(kycRequestSchema.safeParse({ phone: '1234', operator: 'MOOV_MONEY' }).success).toBe(
      false,
    )
  })

  it('rejette un numéro avec lettres', () => {
    expect(
      kycRequestSchema.safeParse({ phone: 'abc12345', operator: 'AIRTEL_MONEY' }).success,
    ).toBe(false)
  })

  it('accepte un numéro international', () => {
    expect(
      kycRequestSchema.safeParse({ phone: '+24166000000', operator: 'MOOV_MONEY' }).success,
    ).toBe(true)
  })
})

describe('pvitCallbackPayloadSchema', () => {
  const validCallback = {
    transactionId: 'TXN-001',
    merchantReferenceId: VALID_UUID,
    status: 'SUCCESS' as const,
    responseCode: '00',
  }

  it('valide un callback minimal', () => {
    expect(pvitCallbackPayloadSchema.safeParse(validCallback).success).toBe(true)
  })

  it('valide un callback complet', () => {
    const result = pvitCallbackPayloadSchema.safeParse({
      ...validCallback,
      amount: 5000,
      operator: 'AIRTEL_MONEY',
      message: 'Paiement réussi',
      signature: 'abc123',
    })
    expect(result.success).toBe(true)
  })

  it('accepte tous les statuts valides', () => {
    const statuses = ['SUCCESS', 'FAILED', 'CANCELLED', 'PENDING'] as const
    for (const status of statuses) {
      expect(pvitCallbackPayloadSchema.safeParse({ ...validCallback, status }).success).toBe(true)
    }
  })

  it('rejette un statut inconnu', () => {
    expect(
      pvitCallbackPayloadSchema.safeParse({ ...validCallback, status: 'UNKNOWN' }).success,
    ).toBe(false)
  })

  it('rejette si transactionId manquant', () => {
    const { transactionId: _, ...rest } = validCallback
    expect(pvitCallbackPayloadSchema.safeParse(rest).success).toBe(false)
  })

  it('rejette si merchantReferenceId est vide', () => {
    expect(
      pvitCallbackPayloadSchema.safeParse({ ...validCallback, merchantReferenceId: '' }).success,
    ).toBe(false)
  })

  it('conserve les champs supplémentaires (passthrough)', () => {
    const result = pvitCallbackPayloadSchema.safeParse({
      ...validCallback,
      extraField: 'extra_value',
    })
    expect(result.success).toBe(true)
    expect((result.data as Record<string, unknown>)?.extraField).toBe('extra_value')
  })
})
