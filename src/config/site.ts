export const siteConfig = {
  name: 'KinyConso',
  description:
    'KinyConso — Boutique en ligne au Gabon. Paiement Mobile Money (Airtel, Moov) et carte bancaire. Livraison rapide.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  locale: 'fr_FR',
  currency: 'FCFA',
  ogImage: '/og-image.png',
  links: {
    instagram: '',
    facebook: '',
    whatsapp: '',
  },
  contact: {
    email: 'contact@kinyconso.com',
    phone: '',
  },
} as const

export type SiteConfig = typeof siteConfig
