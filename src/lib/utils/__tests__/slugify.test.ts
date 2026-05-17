import { describe, expect, it } from 'vitest'

import { slugify } from '../slugify'

describe('slugify', () => {
  it('convertit en minuscules', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('remplace les espaces par des tirets', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz')
  })

  it('supprime les accents', () => {
    expect(slugify('Électronique')).toBe('electronique')
    expect(slugify('Ménage & Cuisine')).toBe('menage-cuisine')
    expect(slugify('Vêtements')).toBe('vetements')
  })

  it('supprime les caractères spéciaux', () => {
    expect(slugify('Produit (Nouveau!)')).toBe('produit-nouveau')
    expect(slugify('Prix: 5.000 FCFA')).toBe('prix-5000-fcfa')
  })

  it('collapse les tirets multiples', () => {
    expect(slugify('foo  --  bar')).toBe('foo-bar')
  })

  it('supprime les tirets en début et fin', () => {
    expect(slugify('-foo-')).toBe('foo')
    expect(slugify('  foo  ')).toBe('foo')
  })

  it('gère une chaîne vide', () => {
    expect(slugify('')).toBe('')
  })

  it('gère les chiffres', () => {
    expect(slugify('Produit 42')).toBe('produit-42')
  })

  it('retourne un slug valide pour des noms de catégories réels', () => {
    expect(slugify('Alimentation & Boissons')).toBe('alimentation-boissons')
    expect(slugify('Électroménager')).toBe('electromenager')
    expect(slugify('Maison & Décoration')).toBe('maison-decoration')
  })

  it('gère les tirets existants correctement', () => {
    expect(slugify('t-shirt homme')).toBe('t-shirt-homme')
  })
})
