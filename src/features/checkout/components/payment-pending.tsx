'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

type RemoteStatus = 'pending' | 'success' | 'failed' | 'cancelled'

interface CheckStatusResponse {
  merchantReferenceId: string
  paymentStatus: RemoteStatus
  orderId: string
  orderNumber: string
  orderStatus: string
}

interface PaymentPendingProps {
  orderId: string
  orderNumber: string
  merchantReferenceId: string
  /** Délai entre chaque check (ms). Default 4s. */
  pollIntervalMs?: number
  /** Délai avant fallback manuel (ms). Default 3 min. */
  fallbackAfterMs?: number
}

export function PaymentPending({
  orderId,
  orderNumber,
  merchantReferenceId,
  pollIntervalMs = 4000,
  fallbackAfterMs = 3 * 60 * 1000,
}: PaymentPendingProps) {
  const router = useRouter()
  const [status, setStatus] = useState<RemoteStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isManualChecking, setIsManualChecking] = useState(false)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    startedAtRef.current = Date.now()
    let cancelled = false

    const tick = async () => {
      try {
        const res = await fetch(
          `/api/pvit/check-status?reference=${encodeURIComponent(merchantReferenceId)}`,
          { cache: 'no-store' },
        )
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/connexion')
            return
          }
          // 502 / 5xx : on continue le polling
          return
        }
        const data = (await res.json()) as CheckStatusResponse
        if (cancelled) return
        setStatus(data.paymentStatus)
        if (data.paymentStatus === 'success') {
          router.replace(`/commandes/${orderId}`)
        }
      } catch {
        // Silent — retry au prochain tick
      } finally {
        if (!cancelled && startedAtRef.current !== null) {
          setElapsedMs(Date.now() - startedAtRef.current)
        }
      }
    }

    void tick()
    const interval = window.setInterval(tick, pollIntervalMs)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [merchantReferenceId, orderId, pollIntervalMs, router])

  const handleManualCheck = async () => {
    setIsManualChecking(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/pvit/check-status?reference=${encodeURIComponent(merchantReferenceId)}`,
        { cache: 'no-store' },
      )
      const data = (await res.json().catch(() => null)) as
        | (CheckStatusResponse & { error?: string })
        | null
      if (!res.ok || !data || !('paymentStatus' in data)) {
        setError(data?.error ?? 'Impossible de vérifier le statut pour le moment')
        return
      }
      setStatus(data.paymentStatus)
      if (data.paymentStatus === 'success') {
        router.replace(`/commandes/${orderId}`)
      }
    } finally {
      setIsManualChecking(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-card border-border space-y-3 rounded-lg border p-8 text-center shadow-sm">
        <CheckCircle2 className="text-primary mx-auto h-12 w-12" aria-hidden />
        <h2 className="text-lg font-semibold">Paiement confirmé</h2>
        <p className="text-muted-foreground text-sm">
          Redirection vers votre commande {orderNumber}…
        </p>
      </div>
    )
  }

  if (status === 'failed' || status === 'cancelled') {
    return (
      <div className="bg-card border-border space-y-4 rounded-lg border p-8 text-center shadow-sm">
        <AlertCircle className="text-destructive mx-auto h-12 w-12" aria-hidden />
        <h2 className="text-lg font-semibold">
          {status === 'cancelled' ? 'Paiement annulé' : 'Paiement échoué'}
        </h2>
        <p className="text-muted-foreground text-sm">
          La transaction n’a pas abouti. Vous pouvez réessayer.
        </p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild variant="ghost" className="min-h-11">
            <Link href={`/commandes/${orderId}`}>Voir la commande</Link>
          </Button>
          <Button asChild className="min-h-11">
            <Link href="/checkout">Réessayer</Link>
          </Button>
        </div>
      </div>
    )
  }

  const showFallback = elapsedMs >= fallbackAfterMs

  return (
    <div className="bg-card border-border space-y-4 rounded-lg border p-8 text-center shadow-sm">
      <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" aria-hidden />
      <h2 className="text-lg font-semibold">Paiement en cours…</h2>
      <p className="text-muted-foreground text-sm">
        Validez le paiement sur votre téléphone. Nous mettons à jour automatiquement votre commande{' '}
        {orderNumber} dès la confirmation.
      </p>

      {showFallback && (
        <div className="border-border bg-muted/40 rounded-md border p-3 text-left text-sm">
          <p className="mb-2">
            Le paiement prend plus de temps que prévu. Vérifiez le statut manuellement :
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 gap-2"
            onClick={handleManualCheck}
            disabled={isManualChecking}
          >
            {isManualChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Vérifier le statut
          </Button>
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>
      )}

      <p className="text-muted-foreground font-mono text-xs">Réf : {merchantReferenceId}</p>
    </div>
  )
}
