import 'server-only'

import type { PaymentOperator } from '@/db/schema/enums'

/**
 * Configuration centralisée de l'intégration PVIT.
 *
 * - `BASE_URL` : URL racine de l'API PVIT (sandbox ou production).
 * - `urlCode`, `operationAccountCode`, `apiPassword`, `callbackUrlCode` :
 *   credentials marchand fournis par PVIT.
 * - `SECRET_TTL_MS` : durée de validité du X-Secret (3600 s d'après PVIT).
 *   On garde une marge de 5 min pour anticiper la rotation.
 *
 * Note : ce module est `server-only`. Les secrets ne doivent jamais être
 * importés depuis le bundle client.
 */

export const PVIT_BASE_URL = process.env.PVIT_BASE_URL ?? 'https://api.pvit.ga'

export const PVIT_ENDPOINTS = {
  auth: '/api/v1/auth/login',
  initiate: '/api/v1/payments/initiate',
  checkStatus: '/api/v1/payments/status',
  kyc: '/api/v1/kyc',
} as const

export const PVIT_SECRET_TTL_MS = 60 * 60 * 1000
export const PVIT_SECRET_REFRESH_MARGIN_MS = 5 * 60 * 1000
export const PVIT_APP_CONFIG_KEY = 'pvit_secret'

export const PVIT_OPERATORS: Record<PaymentOperator, string> = {
  AIRTEL_MONEY: 'AIRTEL_MONEY',
  MOOV_MONEY: 'MOOV_MONEY',
  VISA_MASTERCARD: 'VISA_MASTERCARD',
}

export interface PvitServerEnv {
  urlCode: string
  operationAccountCode: string
  apiPassword: string
  callbackUrlCode: string
}

export function getPvitServerEnv(): PvitServerEnv {
  const urlCode = process.env.PVIT_URL_CODE
  const operationAccountCode = process.env.PVIT_OPERATION_ACCOUNT_CODE
  const apiPassword = process.env.PVIT_API_PASSWORD
  const callbackUrlCode = process.env.PVIT_CALLBACK_URL_CODE

  if (!urlCode || !operationAccountCode || !apiPassword || !callbackUrlCode) {
    throw new Error(
      'Variables PVIT manquantes : PVIT_URL_CODE, PVIT_OPERATION_ACCOUNT_CODE, PVIT_API_PASSWORD et PVIT_CALLBACK_URL_CODE sont requises.',
    )
  }

  return { urlCode, operationAccountCode, apiPassword, callbackUrlCode }
}
