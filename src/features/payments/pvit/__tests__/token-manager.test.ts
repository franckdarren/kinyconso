import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mocks hoistes (avant tout import)

const mocks = vi.hoisted(() => ({
  mockLimit: vi.fn() as Mock,
  mockOnConflict: vi.fn() as Mock,
  mockDeleteWhere: vi.fn() as Mock,
}))

vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: mocks.mockLimit,
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: mocks.mockOnConflict,
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: mocks.mockDeleteWhere,
    }),
  },
}))

vi.mock('@/db/schema', () => ({
  appConfig: {
    key: { name: 'key' },
    value: { name: 'value' },
    description: { name: 'description' },
    updatedAt: { name: 'updatedAt' },
  },
}))

vi.mock('@/config/pvit', () => ({
  PVIT_APP_CONFIG_KEY: 'pvit_secret',
  PVIT_BASE_URL: 'https://api.pvit.test',
  PVIT_ENDPOINTS: { auth: '/api/v1/auth/login' },
  PVIT_SECRET_REFRESH_MARGIN_MS: 5 * 60 * 1000,
  PVIT_SECRET_TTL_MS: 60 * 60 * 1000,
  getPvitServerEnv: vi.fn(() => ({
    urlCode: 'TEST_URL',
    operationAccountCode: 'TEST_ACCOUNT',
    apiPassword: 'TEST_PASS',
    callbackUrlCode: 'TEST_CALLBACK',
  })),
}))

vi.mock('@/features/payments/pvit/logger', () => ({
  pvitLog: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}))

import { getValidToken, invalidateToken, refreshToken } from '../token-manager'
import { PvitError } from '../types'

function futureIso(offsetMs: number) {
  return new Date(Date.now() + offsetMs).toISOString()
}

function makeStoredRow(offsetMs: number) {
  return [{ value: { secret: 'cached-secret', expiresAt: futureIso(offsetMs) } }]
}

function makeFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => '',
  })
}

describe('getValidToken', () => {
  beforeEach(() => {
    mocks.mockLimit.mockResolvedValue([])
    mocks.mockOnConflict.mockResolvedValue(undefined)
    vi.stubGlobal('fetch', makeFetchOk({ secret: 'new-secret', expiresIn: 3600 }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('retourne le secret en cache si non expire', async () => {
    mocks.mockLimit.mockResolvedValueOnce(makeStoredRow(60 * 60 * 1000))
    const token = await getValidToken()
    expect(token).toBe('cached-secret')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rafraichit le token si absent en base', async () => {
    mocks.mockLimit.mockResolvedValueOnce([])
    const token = await getValidToken()
    expect(token).toBe('new-secret')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('rafraichit le token si expire (dans la marge de 5 min)', async () => {
    mocks.mockLimit.mockResolvedValueOnce(makeStoredRow(3 * 60 * 1000))
    const token = await getValidToken()
    expect(token).toBe('new-secret')
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('rafraichit le token si expiresAt est invalide', async () => {
    mocks.mockLimit.mockResolvedValueOnce([{ value: { secret: 'bad', expiresAt: 'not-a-date' } }])
    const token = await getValidToken()
    expect(token).toBe('new-secret')
    expect(fetch).toHaveBeenCalledOnce()
  })
})

describe('refreshToken', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('appelle PVIT et stocke le nouveau secret', async () => {
    mocks.mockOnConflict.mockResolvedValue(undefined)
    vi.stubGlobal('fetch', makeFetchOk({ secret: 'fresh-secret', expiresIn: 3600 }))
    const result = await refreshToken()
    expect(result.secret).toBe('fresh-secret')
    expect(result.expiresAt).toBeDefined()
    expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now())
    expect(mocks.mockOnConflict).toHaveBeenCalledOnce()
  })

  it('utilise PVIT_SECRET_TTL_MS si expiresIn absent de la reponse', async () => {
    vi.stubGlobal('fetch', makeFetchOk({ secret: 'fresh-secret' }))
    const before = Date.now()
    const result = await refreshToken()
    const expiresAt = new Date(result.expiresAt).getTime()
    expect(expiresAt).toBeGreaterThan(before + 50 * 60 * 1000)
  })

  it('leve PvitError sur erreur reseau', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')))
    await expect(refreshToken()).rejects.toBeInstanceOf(PvitError)
    await expect(refreshToken()).rejects.toMatchObject({ message: expect.stringContaining('seau') })
  })

  it('leve PvitError sur reponse HTTP non-ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
        text: async () => 'Unauthorized',
      }),
    )
    await expect(refreshToken()).rejects.toBeInstanceOf(PvitError)
    await expect(refreshToken()).rejects.toMatchObject({ httpStatus: 401 })
  })

  it('leve PvitError si la reponse ne contient pas de secret', async () => {
    vi.stubGlobal('fetch', makeFetchOk({ message: 'ok' }))
    await expect(refreshToken()).rejects.toBeInstanceOf(PvitError)
  })
})

describe('invalidateToken', () => {
  it('supprime le secret de la base', async () => {
    mocks.mockDeleteWhere.mockResolvedValue(undefined)
    await invalidateToken()
    expect(mocks.mockDeleteWhere).toHaveBeenCalledOnce()
  })
})
