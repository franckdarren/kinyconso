import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'

import { siteConfig } from '@/config/site'
import type { HealthPayload, ServiceStatus } from '@/app/api/health/route'

export const metadata: Metadata = {
  title: 'État des services',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

async function fetchHealth(): Promise<HealthPayload | null> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') ?? 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const res = await fetch(`${protocol}://${host}/api/health`, {
      cache: 'no-store',
    })
    return (await res.json()) as HealthPayload
  } catch {
    return null
  }
}

function StatusIcon({ status }: { status: ServiceStatus }) {
  if (status === 'ok') return <CheckCircle className="h-5 w-5 text-green-500" />
  if (status === 'degraded') return <AlertTriangle className="h-5 w-5 text-amber-500" />
  return <XCircle className="h-5 w-5 text-red-500" />
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const classes = {
    ok: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    degraded: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    down: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  const labels = { ok: 'Opérationnel', degraded: 'Dégradé', down: 'Hors service' }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes[status]}`}
    >
      {labels[status]}
    </span>
  )
}

const SERVICE_LABELS: Record<string, string> = {
  database: 'Base de données (Supabase)',
  pvit: 'Token PVIT (X-Secret)',
  fcm: 'Firebase FCM (push)',
}

export default async function AdminHealthPage() {
  const health = await fetchHealth()

  if (!health) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">État des services</h1>
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
          Impossible de contacter l&apos;API /api/health. Vérifiez les logs Vercel.
        </div>
      </div>
    )
  }

  const services = Object.entries(health.services) as [
    string,
    { status: ServiceStatus; latencyMs?: number; detail?: string },
  ][]

  const checkedAt = new Date(health.checkedAt)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">État des services</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Vérifié le {checkedAt.toLocaleDateString('fr-FR')} à{' '}
            {checkedAt.toLocaleTimeString('fr-FR')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon status={health.status} />
          <StatusBadge status={health.status} />
        </div>
      </header>

      {/* Grille des services */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(([key, check]) => (
          <div key={key} className="bg-card border-border rounded-lg border p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{SERVICE_LABELS[key] ?? key}</p>
                {check.latencyMs !== undefined && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Latence : {check.latencyMs} ms
                  </p>
                )}
                {check.detail && (
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {check.detail}
                  </p>
                )}
              </div>
              <StatusIcon status={check.status} />
            </div>
            <div className="mt-3">
              <StatusBadge status={check.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <section className="bg-card border-border rounded-lg border p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold">Actions de diagnostic</h2>
        <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-xs">▸</span>
            <span>
              <strong className="text-foreground">Token PVIT expiré</strong> — appeler manuellement{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                GET /api/cron/pvit-token?secret=&#123;CRON_SECRET&#125;
              </code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-xs">▸</span>
            <span>
              <strong className="text-foreground">Paiements bloqués</strong> — utiliser{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                GET /api/pvit/check-status?merchantReferenceId=&#123;ref&#125;
              </code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-xs">▸</span>
            <span>
              <strong className="text-foreground">Commandes pending bloquées</strong> — appeler{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                GET /api/cron/cleanup-pending-orders?secret=&#123;CRON_SECRET&#125;
              </code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-xs">▸</span>
            <span>
              <strong className="text-foreground">Erreurs détaillées</strong> — consulter{' '}
              <a
                href={`https://sentry.io/organizations/${siteConfig.name.toLowerCase()}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Sentry
              </a>{' '}
              ou les logs Vercel
            </span>
          </li>
        </ul>
      </section>

      {/* Bouton refresh */}
      <div className="flex justify-end">
        <form action="/admin/health">
          <button
            type="submit"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Rafraîchir
          </button>
        </form>
      </div>
    </div>
  )
}
