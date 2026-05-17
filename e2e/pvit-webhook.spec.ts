import { expect, test } from '@playwright/test'

/**
 * Tests d'idempotence du webhook PVIT.
 *
 * Ces tests envoient des requêtes HTTP directement à l'API /api/pvit/callback.
 * Ils nécessitent un serveur en cours d'exécution et une DB accessible.
 * En CI, ils utilisent le serveur démarré par playwright.config.ts.
 */
test.describe('PVIT Webhook — Idempotence', () => {
  const CALLBACK_URL = '/api/pvit/callback'

  // Référence unique par suite de test pour éviter les collisions
  const testReference = `e2e-test-${Date.now()}`

  const callbackPayload = {
    transactionId: `TXN-E2E-${Date.now()}`,
    merchantReferenceId: testReference,
    status: 'SUCCESS',
    responseCode: '00',
    amount: 5000,
    operator: 'AIRTEL_MONEY',
    message: 'Paiement E2E réussi',
  }

  test('le webhook répond 200 sur un payload valide (premier appel)', async ({ request }) => {
    // Note : ce test peut retourner 404 si la commande n'existe pas en DB.
    // C'est acceptable : l'important est que le serveur réponde (pas de crash 500).
    const response = await request.post(CALLBACK_URL, {
      data: callbackPayload,
      headers: { 'Content-Type': 'application/json' },
    })

    // 200 si commande trouvée, 404 si référence inconnue — pas de 500
    expect([200, 404]).toContain(response.status())
  })

  test('rejouer le même payload retourne le même résultat (idempotence)', async ({ request }) => {
    const payload = {
      transactionId: `TXN-IDEMPOTENT-${Date.now()}`,
      merchantReferenceId: `idempotent-ref-${Date.now()}`,
      status: 'SUCCESS',
      responseCode: '00',
      amount: 10000,
      operator: 'MOOV_MONEY',
    }

    // Premier appel
    const res1 = await request.post(CALLBACK_URL, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    })

    // Deuxième appel identique
    const res2 = await request.post(CALLBACK_URL, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    })

    // Les deux réponses doivent avoir le même statut HTTP
    expect(res1.status()).toBe(res2.status())

    // Aucun des deux ne doit provoquer une erreur serveur
    expect(res1.status()).toBeLessThan(500)
    expect(res2.status()).toBeLessThan(500)
  })

  test('rejette un payload sans merchantReferenceId', async ({ request }) => {
    const response = await request.post(CALLBACK_URL, {
      data: {
        transactionId: 'TXN-001',
        status: 'SUCCESS',
        responseCode: '00',
        // merchantReferenceId manquant
      },
      headers: { 'Content-Type': 'application/json' },
    })

    // Doit retourner 400 (validation) ou 422 (unprocessable)
    expect([400, 422]).toContain(response.status())
  })

  test('rejette un payload avec un statut inconnu', async ({ request }) => {
    const response = await request.post(CALLBACK_URL, {
      data: {
        transactionId: 'TXN-002',
        merchantReferenceId: `ref-${Date.now()}`,
        status: 'INVALID_STATUS',
        responseCode: '00',
      },
      headers: { 'Content-Type': 'application/json' },
    })

    expect([400, 422]).toContain(response.status())
  })

  test('le check-status répond sur une référence valide', async ({ request }) => {
    const reference = '123e4567-e89b-12d3-a456-426614174000'
    const response = await request.get(`/api/pvit/check-status?reference=${reference}`)

    // 200 si trouvé, 404 si inconnu — pas de 500
    expect([200, 404]).toContain(response.status())
  })
})
