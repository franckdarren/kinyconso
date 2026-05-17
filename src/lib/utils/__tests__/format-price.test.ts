import { describe, expect, it } from 'vitest'

import { formatPrice, parsePrice } from '../format-price'

// Intl.NumberFormat('fr-FR') utilise U+202F (narrow no-break space) comme separateur
// de milliers selon le standard Unicode CLDR. On normalise vers un espace ordinaire.
function normalizeSpaces(str: string): string {
  return str.replace(/[   ]/g, ' ')
}

describe('formatPrice', () => {
  it('formate un prix entier en FCFA', () => {
    expect(normalizeSpaces(formatPrice(5000))).toBe('5 000 FCFA')
  })

  it('formate zero', () => {
    expect(normalizeSpaces(formatPrice(0))).toBe('0 FCFA')
  })

  it('formate un grand nombre', () => {
    expect(normalizeSpaces(formatPrice(1500000))).toBe('1 500 000 FCFA')
  })

  it('formate un nombre simple sans separateur', () => {
    expect(normalizeSpaces(formatPrice(500))).toBe('500 FCFA')
  })

  it('ne contient pas de decimales', () => {
    const result = formatPrice(1000)
    expect(result).not.toContain(',')
    expect(result).not.toContain('.')
  })

  it('se termine par FCFA', () => {
    expect(formatPrice(9999)).toMatch(/FCFA$/)
  })
})

describe('parsePrice', () => {
  it('parse une chaine avec espaces', () => {
    expect(parsePrice('5 000 FCFA')).toBe(5000)
  })

  it('parse un nombre brut', () => {
    expect(parsePrice('1500')).toBe(1500)
  })

  it('retourne 0 pour une chaine vide', () => {
    expect(parsePrice('')).toBe(0)
  })

  it('retourne 0 pour une chaine sans chiffres', () => {
    expect(parsePrice('abc')).toBe(0)
  })

  it('parse un grand nombre formate', () => {
    expect(parsePrice('1 500 000 FCFA')).toBe(1500000)
  })

  it('ignore les caracteres non numeriques', () => {
    expect(parsePrice('1.500,00 eur')).toBe(150000)
  })

  it('roundtrip : formatPrice -> parsePrice', () => {
    const original = 12500
    expect(parsePrice(formatPrice(original))).toBe(original)
  })
})
