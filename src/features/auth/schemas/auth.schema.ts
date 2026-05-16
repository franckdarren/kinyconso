import { z } from 'zod'

const PASSWORD_MIN = 8

export const signInSchema = z.object({
  email: z.email({ message: 'Email invalide' }),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom complet doit faire au moins 2 caractères').max(120),
    phone: z
      .string()
      .min(8, 'Numéro de téléphone invalide')
      .max(20)
      .regex(/^[0-9+\s-]+$/, 'Numéro de téléphone invalide'),
    email: z.email({ message: 'Email invalide' }),
    password: z
      .string()
      .min(PASSWORD_MIN, `Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export const requestPasswordResetSchema = z.object({
  email: z.email({ message: 'Email invalide' }),
})

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
