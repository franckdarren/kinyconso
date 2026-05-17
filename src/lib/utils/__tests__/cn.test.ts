import { describe, expect, it } from 'vitest'

import { cn } from '../cn'

describe('cn', () => {
  it('retourne une chaîne vide sans argument', () => {
    expect(cn()).toBe('')
  })

  it('passe une classe simple', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('fusionne plusieurs classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignore les valeurs falsy', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar')
  })

  it('résout les conflits Tailwind (dernière valeur gagne)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('gère les objets conditionnels', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
    expect(cn({ foo: true, bar: true })).toBe('foo bar')
  })

  it('gère les tableaux', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
    expect(cn(['foo', false, 'bar'])).toBe('foo bar')
  })

  it('fusionne correctement les variantes Tailwind complexes', () => {
    expect(cn('px-2 py-1 bg-red', 'p-3')).toBe('bg-red p-3')
  })

  it('gère les classes conditionnelles imbriquées', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', { active: isActive, disabled: isDisabled })).toBe('base active')
  })
})
