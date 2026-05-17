import 'server-only'

import { PVIT_BASE_URL, PVIT_ENDPOINTS, getPvitServerEnv } from '@/config/pvit'

import { pvitLog } from './logger'
import { invalidateToken, getValidToken } from './token-manager'
import {
  PvitError,
  type PvitCheckStatusRequest,
  type PvitCheckStatusResponse,
  type PvitInitiateRequest,
  type PvitInitiateResponse,
  type PvitKycRequest,
  type PvitKycResponse,
} from './types'

interface RequestOptions {
  event: string
  merchantReferenceId?: string
  retryOnAuthError?: boolean
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '')
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

async function pvitFetch<T>(path: string, init: RequestInit, options: RequestOptions): Promise<T> {
  const env = getPvitServerEnv()
  const url = `${PVIT_BASE_URL}${path}`
  const secret = await getValidToken()
  const startedAt = Date.now()

  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  headers.set('Accept', 'application/json')
  headers.set('X-Secret', secret)
  headers.set('X-URL-Code', env.urlCode)
  headers.set('X-Operation-Account-Code', env.operationAccountCode)

  let response: Response
  try {
    response = await fetch(url, { ...init, headers, cache: 'no-store' })
  } catch (cause) {
    pvitLog.error({
      event: `${options.event}.network_error`,
      merchantReferenceId: options.merchantReferenceId,
      error: cause instanceof Error ? cause.message : String(cause),
      durationMs: Date.now() - startedAt,
    })
    throw new PvitError('Échec réseau PVIT', {
      body: cause instanceof Error ? cause.message : cause,
    })
  }

  const durationMs = Date.now() - startedAt
  const body = await readBody(response)

  if (response.status === 401 && options.retryOnAuthError !== false) {
    pvitLog.warn({
      event: `${options.event}.auth_expired`,
      merchantReferenceId: options.merchantReferenceId,
      httpStatus: response.status,
      durationMs,
    })
    await invalidateToken()
    return pvitFetch<T>(path, init, { ...options, retryOnAuthError: false })
  }

  if (!response.ok) {
    pvitLog.error({
      event: `${options.event}.http_error`,
      merchantReferenceId: options.merchantReferenceId,
      httpStatus: response.status,
      durationMs,
      body,
    })
    throw new PvitError(`PVIT HTTP ${response.status}`, {
      httpStatus: response.status,
      body,
    })
  }

  pvitLog.info({
    event: `${options.event}.success`,
    merchantReferenceId: options.merchantReferenceId,
    httpStatus: response.status,
    durationMs,
  })

  return body as T
}

export async function pvitInitiatePayment(
  payload: PvitInitiateRequest,
): Promise<PvitInitiateResponse> {
  return pvitFetch<PvitInitiateResponse>(
    PVIT_ENDPOINTS.initiate,
    { method: 'POST', body: JSON.stringify(payload) },
    { event: 'pvit.payment.initiate', merchantReferenceId: payload.merchantReferenceId },
  )
}

export async function pvitCheckStatus(
  payload: PvitCheckStatusRequest,
): Promise<PvitCheckStatusResponse> {
  const query = new URLSearchParams({ merchantReferenceId: payload.merchantReferenceId })
  return pvitFetch<PvitCheckStatusResponse>(
    `${PVIT_ENDPOINTS.checkStatus}?${query.toString()}`,
    { method: 'GET' },
    { event: 'pvit.payment.check_status', merchantReferenceId: payload.merchantReferenceId },
  )
}

export async function pvitKyc(payload: PvitKycRequest): Promise<PvitKycResponse> {
  return pvitFetch<PvitKycResponse>(
    PVIT_ENDPOINTS.kyc,
    { method: 'POST', body: JSON.stringify(payload) },
    { event: 'pvit.kyc' },
  )
}
