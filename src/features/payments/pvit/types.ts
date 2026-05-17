import type { PaymentOperator } from '@/db/schema/enums'

/**
 * Codes de réponse standard PVIT.
 * - "00" / "0000" : succès
 * - "01" : en attente
 * - autres : échecs / erreurs métier
 */
export type PvitResponseCode = string

export interface PvitAuthRequest {
  urlCode: string
  apiPassword: string
}

export interface PvitAuthResponse {
  secret: string
  expiresIn?: number
}

export interface PvitInitiateRequest {
  merchantReferenceId: string
  amount: number
  operator: PaymentOperator
  customerPhone?: string
  customerEmail?: string
  customerName?: string
  description?: string
  callbackUrlCode: string
}

export interface PvitInitiateResponse {
  transactionId: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  responseCode: PvitResponseCode
  message?: string
}

export interface PvitCheckStatusRequest {
  merchantReferenceId: string
}

export interface PvitCheckStatusResponse {
  transactionId: string
  merchantReferenceId: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  responseCode: PvitResponseCode
  amount: number
  operator: PaymentOperator
  message?: string
  paidAt?: string
}

export interface PvitCallbackPayload {
  transactionId: string
  merchantReferenceId: string
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED'
  responseCode: PvitResponseCode
  amount: number
  operator: PaymentOperator
  message?: string
  signature?: string
  raw?: Record<string, unknown>
}

export interface PvitKycRequest {
  phone: string
  operator: PaymentOperator
}

export interface PvitKycResponse {
  matched: boolean
  fullName?: string
  responseCode: PvitResponseCode
  message?: string
}

export interface PvitStoredSecret {
  secret: string
  expiresAt: string
}

export class PvitError extends Error {
  readonly responseCode?: PvitResponseCode
  readonly httpStatus?: number
  readonly body?: unknown

  constructor(
    message: string,
    options?: { responseCode?: PvitResponseCode; httpStatus?: number; body?: unknown },
  ) {
    super(message)
    this.name = 'PvitError'
    this.responseCode = options?.responseCode
    this.httpStatus = options?.httpStatus
    this.body = options?.body
  }
}
