import { describe, expect, it } from 'vitest'

import { generateMerchantReference } from '../generate-reference'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('generateMerchantReference', () => {
  it('retourne un UUID v4 valide', () => {
    const ref = generateMerchantReference()
    expect(ref).toMatch(UUID_REGEX)
  })

  it('génère des références uniques à chaque appel', () => {
    const refs = new Set(Array.from({ length: 100 }, () => generateMerchantReference()))
    expect(refs.size).toBe(100)
  })

  it('retourne une chaîne de 36 caractères', () => {
    expect(generateMerchantReference()).toHaveLength(36)
  })

  it('contient exactement 4 tirets', () => {
    const ref = generateMerchantReference()
    expect(ref.split('-')).toHaveLength(5)
  })
})
