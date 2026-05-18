import 'server-only'

import { pvitCheckStatus } from './client'
import { pvitLog } from './logger'
import { processPvitCallback, type CallbackOutcome } from './process-callback'

export interface ReconcileResult {
  remoteStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  responseCode: string
  outcome: CallbackOutcome | null
}

/**
 * Source de vérité unique pour l'état d'un paiement PVIT.
 *
 * Le webhook PVIT n'est PAS authentifié de façon fiable (pas de schéma de
 * signature documenté). On ne fait donc jamais confiance au `status` du corps
 * de la requête entrante. À la place, on interroge PVIT côté serveur via
 * `pvitCheckStatus` (appel authentifié par X-Secret) et on applique la
 * transition à partir de cette réponse faisant autorité.
 *
 * Utilisé par :
 *   - le webhook POST /api/pvit/callback (déclencheur)
 *   - la route GET /api/pvit/check-status (fallback polling)
 */
export async function reconcilePvitPayment(merchantReferenceId: string): Promise<ReconcileResult> {
  const remote = await pvitCheckStatus({ merchantReferenceId })

  if (remote.status === 'PENDING') {
    pvitLog.info({
      event: 'pvit.reconcile.still_pending',
      merchantReferenceId,
    })
    return { remoteStatus: remote.status, responseCode: remote.responseCode, outcome: null }
  }

  const outcome = await processPvitCallback({
    transactionId: remote.transactionId,
    merchantReferenceId,
    status: remote.status,
    responseCode: remote.responseCode,
    amount: remote.amount,
    operator: remote.operator,
    message: remote.message,
  })

  return { remoteStatus: remote.status, responseCode: remote.responseCode, outcome }
}
