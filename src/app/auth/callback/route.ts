import { NextResponse, type NextRequest } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Callback OAuth / Magic Link / Email Confirmation.
 * Échange le `code` reçu de Supabase contre une session,
 * puis redirige vers `next` (ou la racine).
 */
/**
 * N'autorise que les chemins relatifs internes pour éviter un open redirect.
 * Rejette les URL absolues, les schémas (`//evil.com`, `/\evil.com`) et tout
 * ce qui ne commence pas par un simple `/`.
 */
function safeNext(raw: string | null): string {
  if (!raw) return '/'
  if (!raw.startsWith('/')) return '/'
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/'
  return raw
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/connexion?error=${encodeURIComponent('Lien invalide ou expiré')}`,
  )
}
