import 'server-only'

type LogLevel = 'info' | 'warn' | 'error'

interface PvitLogContext {
  event: string
  merchantReferenceId?: string
  pvitTransactionId?: string
  status?: string
  responseCode?: string
  durationMs?: number
  [key: string]: unknown
}

/**
 * Redacte les champs sensibles des contextes loggés.
 * On évite que les credentials se retrouvent dans les logs Vercel.
 */
const SENSITIVE_KEYS = new Set(['secret', 'apiPassword', 'password', 'authorization', 'x-secret'])

function redact<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      out[key] = '[REDACTED]'
      continue
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = redact(value as Record<string, unknown>)
    } else {
      out[key] = value
    }
  }
  return out
}

function write(level: LogLevel, context: PvitLogContext): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    source: 'pvit',
    ...redact(context),
  }
  const line = JSON.stringify(payload)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  // eslint-disable-next-line no-console -- logger structuré PVIT (info via stdout)
  else console.log(line)
}

export const pvitLog = {
  info: (context: PvitLogContext) => write('info', context),
  warn: (context: PvitLogContext) => write('warn', context),
  error: (context: PvitLogContext) => write('error', context),
}
