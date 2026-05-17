import { describe, expect, it } from 'vitest'

import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from '../auth.schema'

describe('signInSchema', () => {
  it('valide un email + mot de passe corrects', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: 'secret123' })
    expect(result.success).toBe(true)
  })

  it('rejette un email invalide', () => {
    const result = signInSchema.safeParse({ email: 'not-an-email', password: 'secret123' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toContain('email')
  })

  it('rejette un mot de passe vide', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toContain('password')
  })

  it('rejette un champ manquant', () => {
    expect(signInSchema.safeParse({ email: 'user@example.com' }).success).toBe(false)
    expect(signInSchema.safeParse({ password: 'secret' }).success).toBe(false)
  })
})

describe('signUpSchema', () => {
  const validPayload = {
    fullName: 'Jean Dupont',
    phone: '066000000',
    email: 'jean@example.com',
    password: 'motdepasse1',
    confirmPassword: 'motdepasse1',
  }

  it('valide une inscription complète et correcte', () => {
    expect(signUpSchema.safeParse(validPayload).success).toBe(true)
  })

  it('rejette si les mots de passe ne correspondent pas', () => {
    const result = signUpSchema.safeParse({ ...validPayload, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    const paths = result.error?.issues.map((i) => i.path[0])
    expect(paths).toContain('confirmPassword')
  })

  it('rejette un mot de passe trop court (< 8 caractères)', () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un nom trop court (< 2 caractères)', () => {
    const result = signUpSchema.safeParse({ ...validPayload, fullName: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejette un nom trop long (> 120 caractères)', () => {
    const result = signUpSchema.safeParse({ ...validPayload, fullName: 'A'.repeat(121) })
    expect(result.success).toBe(false)
  })

  it('rejette un numéro de téléphone avec lettres', () => {
    const result = signUpSchema.safeParse({ ...validPayload, phone: 'abcdefgh' })
    expect(result.success).toBe(false)
  })

  it('accepte un numéro avec + en préfixe', () => {
    const result = signUpSchema.safeParse({ ...validPayload, phone: '+241066000000' })
    expect(result.success).toBe(true)
  })

  it('rejette un email invalide', () => {
    const result = signUpSchema.safeParse({ ...validPayload, email: 'invalid' })
    expect(result.success).toBe(false)
  })
})

describe('requestPasswordResetSchema', () => {
  it('valide un email valide', () => {
    expect(requestPasswordResetSchema.safeParse({ email: 'user@example.com' }).success).toBe(true)
  })

  it('rejette un email invalide', () => {
    expect(requestPasswordResetSchema.safeParse({ email: 'pas-un-email' }).success).toBe(false)
  })
})

describe('updatePasswordSchema', () => {
  it('valide deux mots de passe identiques', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'nouveaumdp1',
      confirmPassword: 'nouveaumdp1',
    })
    expect(result.success).toBe(true)
  })

  it('rejette si les mots de passe diffèrent', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'nouveaumdp1',
      confirmPassword: 'autre',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un mot de passe trop court', () => {
    const result = updatePasswordSchema.safeParse({
      password: 'court',
      confirmPassword: 'court',
    })
    expect(result.success).toBe(false)
  })
})
