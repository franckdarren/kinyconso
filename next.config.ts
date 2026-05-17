import withPWAInit from '@ducanh2912/next-pwa'
import type { NextConfig } from 'next'

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    // Page de fallback hors-ligne pour les navigations
    navigateFallback: '/offline',
    // Pas de fallback pour les routes API et auth (réseau uniquement)
    navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
    runtimeCaching: [
      // Paiement PVIT — jamais mis en cache
      {
        urlPattern: /^\/api\/pvit\//i,
        handler: 'NetworkOnly',
      },
      // Icônes PWA générées dynamiquement
      {
        urlPattern: /^\/icons\//i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'pwa-icons',
          expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      // Images Supabase Storage
      {
        urlPattern: /\.supabase\.co\/storage\//i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'supabase-storage',
          expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // Images statiques
      {
        urlPattern: /\.(?:jpg|jpeg|png|gif|svg|ico|webp|avif)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-images',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // Assets JS / CSS / fonts
      {
        urlPattern: /\.(?:js|css|woff2|woff|ttf)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      // Pages catalogue — NetworkFirst avec fallback cache
      {
        urlPattern: /^\/(produits|categories)(\/|$)/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'catalogue-pages',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
    ],
  },
})

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : '*.supabase.co'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default withPWA(nextConfig)
