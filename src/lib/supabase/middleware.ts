import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_AUTH_PATHS = [
  '/auth/connexion',
  '/auth/inscription',
  '/auth/mot-de-passe-oublie',
  '/auth/reinitialisation',
  '/auth/callback',
]

const PROTECTED_USER_PREFIXES = ['/compte', '/commandes', '/checkout']
const PROTECTED_ADMIN_PREFIXES = ['/admin']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirige les utilisateurs connectés loin des pages d'auth (sauf callback).
  if (
    user &&
    PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p)) &&
    !pathname.startsWith('/auth/callback') &&
    !pathname.startsWith('/auth/reinitialisation')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Routes utilisateur protégées
  if (!user && PROTECTED_USER_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/connexion'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Routes admin — la vérification du rôle se fait dans le layout admin
  // (le middleware vérifie uniquement l'authentification).
  if (!user && PROTECTED_ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/connexion'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
