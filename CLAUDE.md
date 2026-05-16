# CLAUDE.md — Instructions Projet E-commerce PWA

> Ce fichier est la référence absolue du projet. Claude Code doit le lire en entier avant toute action.

---

## 🎯 Vision du projet

Plateforme e-commerce moderne sous forme de **PWA (Progressive Web App)**, monovendeur, mobile-first (Android prioritaire), SEO-friendly, en **français uniquement**, évolutive vers un marketplace multivendeur.

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16+ App Router |
| Langage | TypeScript (strict) |
| Base de données | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth natif |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| UI | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| State management | Zustand |
| Paiement | PVIT (Airtel Money, Moov Money, Visa/Mastercard) |
| Push notifications | Firebase Cloud Messaging (FCM) |
| PWA | next-pwa |
| Déploiement | Vercel |
| Devise | FCFA (XAF) uniquement |

---

## 📁 Structure du projet

```
src/
│
├── app/
│   ├── (store)/                    # Routes publiques vitrine
│   │   ├── page.tsx                # Accueil
│   │   ├── produits/
│   │   │   ├── page.tsx            # Liste produits
│   │   │   └── [slug]/page.tsx     # Détail produit
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx
│   │   ├── panier/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── commandes/
│   │       └── [id]/page.tsx
│   │
│   ├── admin/                      # Interface admin (protégée)
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Dashboard
│   │   ├── produits/
│   │   ├── commandes/
│   │   ├── categories/
│   │   └── clients/
│   │
│   ├── auth/
│   │   ├── connexion/page.tsx
│   │   ├── inscription/page.tsx
│   │   └── callback/route.ts
│   │
│   ├── api/
│   │   ├── pvit/
│   │   │   ├── initiate/route.ts   # Initier un paiement
│   │   │   ├── callback/route.ts   # Webhook PVIT
│   │   │   ├── check-status/route.ts
│   │   │   └── kyc/route.ts
│   │   └── webhooks/
│   │       └── fcm/route.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                         # shadcn/ui components
│   └── shared/                     # Composants partagés inter-features
│       ├── Header/
│       ├── Footer/
│       ├── Navbar/
│       └── LoadingSpinner/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions/
│   │   ├── schemas/
│   │   └── types/
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard/
│   │   │   ├── ProductGrid/
│   │   │   ├── ProductDetail/
│   │   │   └── ProductForm/        # Admin
│   │   ├── hooks/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   └── types/
│   │
│   ├── categories/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions/
│   │   ├── queries/
│   │   └── types/
│   │
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartDrawer/
│   │   │   ├── CartItem/
│   │   │   └── CartSummary/
│   │   ├── hooks/
│   │   ├── store/                  # Zustand store du panier
│   │   └── types/
│   │
│   ├── checkout/
│   │   ├── components/
│   │   │   ├── CheckoutForm/
│   │   │   ├── DeliverySelector/   # Sélection livraison + montant
│   │   │   ├── OperatorSelector/   # Airtel / Moov / Visa
│   │   │   └── OrderSummary/
│   │   ├── hooks/
│   │   ├── actions/
│   │   └── types/
│   │
│   ├── orders/
│   │   ├── components/
│   │   │   ├── OrderList/
│   │   │   ├── OrderDetail/
│   │   │   └── OrderStatusBadge/
│   │   ├── hooks/
│   │   ├── actions/
│   │   ├── queries/
│   │   └── types/
│   │
│   ├── payments/
│   │   ├── pvit/
│   │   │   ├── client.ts           # Wrapper PVIT API
│   │   │   ├── token-manager.ts    # Rotation clé X-Secret (cron)
│   │   │   ├── webhook-handler.ts  # Traitement callback idempotent
│   │   │   ├── kyc.ts
│   │   │   ├── check-status.ts
│   │   │   └── types.ts
│   │   └── types/
│   │
│   ├── notifications/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── fcm/
│   │   │   ├── client.ts
│   │   │   └── send.ts
│   │   └── types/
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── StatsCards/
│   │   │   ├── RevenueChart/
│   │   │   ├── RecentOrders/
│   │   │   └── TopProducts/
│   │   ├── hooks/
│   │   └── queries/
│   │
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions/
│   │   └── types/
│   │
│   └── storage/
│       ├── hooks/
│       ├── actions/
│       └── types/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Client-side Supabase
│   │   ├── server.ts               # Server-side Supabase (SSR)
│   │   └── admin.ts                # Admin client (service_role)
│   │
│   └── utils/
│       ├── cn.ts                   # clsx + tailwind-merge
│       ├── format-price.ts         # Formatage FCFA
│       ├── generate-reference.ts   # Génération merchant_reference_id
│       └── slugify.ts
│
├── db/
│   ├── schema/
│   │   ├── index.ts                # Re-export tous les schemas
│   │   ├── users.ts
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── orders.ts
│   │   ├── order-items.ts
│   │   ├── payments.ts
│   │   ├── delivery-options.ts
│   │   ├── cart.ts
│   │   └── notifications.ts
│   │
│   ├── migrations/                 # Drizzle migrations
│   └── index.ts                    # Drizzle client
│
├── stores/
│   ├── cart.store.ts               # Zustand — panier
│   ├── ui.store.ts                 # Zustand — état UI global
│   └── auth.store.ts               # Zustand — état auth client
│
├── hooks/
│   ├── use-debounce.ts
│   ├── use-media-query.ts
│   └── use-outside-click.ts
│
├── types/
│   ├── index.ts
│   ├── supabase.ts                 # Types générés Supabase
│   └── pvit.ts                     # Types PVIT API
│
└── config/
    ├── site.ts                     # Nom site, URL, méta
    ├── pvit.ts                     # Config PVIT (URLs, codes)
    └── fcm.ts                      # Config Firebase
```

---

## 🗄️ Schéma de base de données (Drizzle ORM)

### Conventions
- Toutes les tables utilisent `uuid` comme clé primaire (`gen_random_uuid()`)
- `created_at` et `updated_at` sur toutes les tables
- Nommage snake_case pour les colonnes
- Soft delete avec `deleted_at` sur produits et commandes

### Tables

#### `users` (extension de auth.users Supabase)
```ts
id: uuid (FK → auth.users.id)
full_name: text
phone: text
address: text
city: text
role: enum('customer', 'admin')  -- défaut: customer
fcm_token: text                   -- token FCM pour push
created_at: timestamp
updated_at: timestamp
```

#### `categories`
```ts
id: uuid
name: text (unique)
slug: text (unique)
description: text
image_url: text
parent_id: uuid (FK → categories.id, nullable) -- pour sous-catégories futures
is_active: boolean (défaut: true)
sort_order: integer (défaut: 0)
created_at: timestamp
updated_at: timestamp
```

#### `products`
```ts
id: uuid
name: text
slug: text (unique)
description: text
price: integer               -- en FCFA, stocké en centimes (ex: 5000 = 50.00 XAF)
compare_at_price: integer    -- prix barré (nullable)
stock_quantity: integer (défaut: 0)
category_id: uuid (FK → categories.id)
images: text[]               -- tableau d'URLs Supabase Storage
is_active: boolean (défaut: true)
is_featured: boolean (défaut: false)
weight: integer              -- en grammes (pour livraison)
deleted_at: timestamp        -- soft delete
created_at: timestamp
updated_at: timestamp
```

#### `delivery_options`
```ts
id: uuid
name: text                   -- ex: "Livraison standard", "Livraison express"
description: text
price: integer               -- en FCFA
estimated_days: integer      -- délai en jours
is_active: boolean (défaut: true)
sort_order: integer
created_at: timestamp
updated_at: timestamp
```

#### `orders`
```ts
id: uuid
order_number: text (unique)  -- ex: CMD-2024-00001
user_id: uuid (FK → users.id)
status: enum('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
subtotal: integer            -- total produits en FCFA
delivery_fee: integer        -- frais de livraison
total: integer               -- subtotal + delivery_fee
delivery_option_id: uuid (FK → delivery_options.id)
delivery_address: jsonb      -- {full_name, phone, address, city}
notes: text
deleted_at: timestamp
created_at: timestamp
updated_at: timestamp
```

#### `order_items`
```ts
id: uuid
order_id: uuid (FK → orders.id)
product_id: uuid (FK → products.id)
product_name: text           -- snapshot au moment de la commande
product_image: text          -- snapshot
unit_price: integer          -- snapshot
quantity: integer
subtotal: integer            -- unit_price * quantity
created_at: timestamp
```

#### `payments`
```ts
id: uuid
order_id: uuid (FK → orders.id, unique)
status: enum('pending', 'success', 'failed', 'cancelled')
operator: enum('AIRTEL_MONEY', 'MOOV_MONEY', 'VISA_MASTERCARD')
amount: integer
fees: integer                -- frais opérateur
total_amount: integer        -- montant total débité
customer_phone: text
pvit_transaction_id: text    -- PAY260226747050
merchant_reference_id: text (unique)  -- notre référence interne — IDEMPOTENCE
pvit_callback_received_at: timestamp
raw_callback_payload: jsonb  -- payload brut PVIT pour audit
created_at: timestamp
updated_at: timestamp
```

#### `cart` (persistance serveur optionnelle)
```ts
id: uuid
user_id: uuid (FK → users.id, unique)
items: jsonb                 -- [{product_id, quantity, price_snapshot}]
created_at: timestamp
updated_at: timestamp
```

#### `notifications`
```ts
id: uuid
user_id: uuid (FK → users.id)
title: text
body: text
type: enum('order_confirmed', 'order_shipped', 'order_delivered', 'payment_success', 'payment_failed', 'promo')
data: jsonb                  -- données additionnelles (order_id, etc.)
is_read: boolean (défaut: false)
sent_at: timestamp
created_at: timestamp
```

---

## 💳 Intégration PVIT

### Architecture du paiement

```
Client → POST /api/pvit/initiate
  → Crée order + payment(status: pending) en DB
  → Appelle PVIT REST API
  → Retourne statut PENDING au client

PVIT → POST /api/pvit/callback (Webhook)
  → Vérifie merchant_reference_id (idempotence)
  → Met à jour payment.status (success/failed)
  → Met à jour order.status
  → Envoie notification FCM au client
  → Répond { transactionId, responseCode } à PVIT
```

### Gestion de la clé secrète (X-Secret)

- La clé expire toutes les **3600 secondes**
- Un **cron job Vercel** (`/api/cron/pvit-token`) tourne toutes les **50 minutes** pour renouveler la clé
- La clé est stockée en **variable d'environnement dynamique** ou dans Supabase (table `app_config`)
- La clé n'est **jamais exposée côté client**

### Idempotence du webhook

```ts
// Dans webhook-handler.ts
const existing = await db.query.payments.findFirst({
  where: eq(payments.merchantReferenceId, payload.merchantReferenceId)
})
if (existing?.status !== 'pending') {
  // Déjà traité — renvoyer l'accusé sans retraiter
  return { transactionId: payload.transactionId, responseCode: payload.code }
}
```

### Fallback Check Status

Si le webhook n'arrive pas dans les **3 minutes**, le client peut appeler `/api/pvit/check-status?reference=XXX` qui interroge directement l'API PVIT.

### Opérateurs supportés

| Opérateur | Code PVIT |
|---|---|
| Airtel Money | `AIRTEL_MONEY` |
| Moov Money | `MOOV_MONEY` |
| Visa / Mastercard | `VISA_MASTERCARD` |

---

## 🚚 Livraison

- Les options de livraison sont gérées dans la table `delivery_options`
- Au checkout, le client **sélectionne une option** → le montant s'ajoute au sous-total
- Le `delivery_fee` est **snapshot** dans la commande au moment de la validation
- L'admin peut créer/modifier/désactiver les options depuis le panel `/admin`

---

## 🔐 Sécurité

### Row Level Security (RLS) Supabase

Activer RLS sur toutes les tables. Politiques minimales :

```sql
-- users : lecture/modification uniquement de son propre profil
-- orders : un client ne voit que ses propres commandes
-- payments : inaccessible en lecture directe côté client (admin only)
-- products/categories : lecture publique, écriture admin only
-- cart : un client ne voit que son propre panier
```

### Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# PVIT
PVIT_URL_CODE=
PVIT_OPERATION_ACCOUNT_CODE=
PVIT_API_PASSWORD=
PVIT_CALLBACK_URL_CODE=

# Firebase FCM
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVER_KEY=

# App
NEXT_PUBLIC_APP_URL=
CRON_SECRET=                    # Pour sécuriser le cron job PVIT
```

### Règles importantes

- Ne jamais utiliser `SUPABASE_SERVICE_ROLE_KEY` dans le code client
- Toutes les routes `/api/pvit/*` sont Server-side uniquement
- Le webhook PVIT doit valider que la requête vient bien de PVIT (vérification IP si possible)
- `merchant_reference_id` généré avec `crypto.randomUUID()` côté serveur

---

## 🎨 UI / UX

### Conventions

- **Mobile-first** — tous les composants designés pour mobile d'abord
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants de base (boutons, modals, forms, etc.)
- **Langue** : tout le texte visible en **français**
- Formatage prix : `new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'`

### Thème couleurs (à définir dans `tailwind.config.ts`)

```ts
// Palette suggérée — adapter selon la charte de la boutique
primary: '#...'       // couleur principale de la marque
secondary: '#...'
accent: '#...'
```

### Pages vitrine minimales

| Route | Description |
|---|---|
| `/` | Accueil — hero, produits en vedette, catégories |
| `/produits` | Catalogue — filtres, recherche, pagination |
| `/produits/[slug]` | Fiche produit — images, prix, ajout panier |
| `/categories/[slug]` | Produits par catégorie |
| `/panier` | Panier — liste items, totaux |
| `/checkout` | Tunnel paiement — adresse, livraison, opérateur PVIT |
| `/commandes/[id]` | Confirmation et suivi commande |
| `/auth/connexion` | Page connexion |
| `/auth/inscription` | Page inscription |

### Pages admin minimales

| Route | Description |
|---|---|
| `/admin` | Dashboard — stats, commandes récentes |
| `/admin/produits` | Liste + CRUD produits |
| `/admin/commandes` | Liste + détail commandes |
| `/admin/categories` | Gestion catégories |
| `/admin/clients` | Liste clients |
| `/admin/livraisons` | Gestion options livraison |

---

## ⚡ Performance

- **Images** : utiliser `next/image` systématiquement
- **Lazy loading** sur les listes de produits
- **Server Components** par défaut — `'use client'` seulement si nécessaire
- **Metadata** SEO sur chaque page (`generateMetadata`)
- **Static generation** pour les pages catégories/produits quand possible (`generateStaticParams`)
- **Infinite scroll** ou pagination sur le catalogue

---

## 🧪 Conventions de code

### Nommage

```
Composants      : PascalCase   → ProductCard.tsx
Hooks           : camelCase    → useCart.ts (préfixe use)
Actions serveur : camelCase    → createOrder.ts
Types           : PascalCase   → OrderStatus
Variables/foncs : camelCase
Constantes      : UPPER_SNAKE  → MAX_CART_ITEMS
```

### Server Actions (Next.js)

Utiliser les Server Actions pour toutes les mutations :

```ts
'use server'
// features/products/actions/create-product.ts
export async function createProduct(data: CreateProductInput) {
  // validation Zod
  // vérification auth (admin only)
  // insertion Drizzle
  // revalidatePath
}
```

### Gestion d'erreurs

Toujours retourner un objet `{ success, data?, error? }` depuis les actions :

```ts
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

### Validation Zod

Chaque feature a ses propres schemas dans `features/[feature]/schemas/` :

```ts
// features/products/schemas/product.schema.ts
export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  price: z.number().int().positive(),
  // ...
})
```

---

## 🔄 Flux métier clés

### Flux commande complète

```
1. Client ajoute produits au panier (Zustand)
2. Client va au checkout
3. Saisit adresse de livraison
4. Sélectionne option de livraison → prix mis à jour
5. Sélectionne opérateur PVIT (Airtel / Moov / Visa)
6. Saisit numéro de téléphone (ou infos carte)
7. Clic "Payer"
   → Server Action createOrder() :
      a. Valide le panier
      b. Crée la commande en DB (status: pending)
      c. Crée le paiement en DB (status: pending)
      d. Génère merchant_reference_id unique
      e. Appelle PVIT API → reçoit PENDING
8. Client voit écran "Paiement en cours..."
9. PVIT envoie webhook → /api/pvit/callback
   → Vérification idempotence
   → Update payment + order status
   → Notification FCM push au client
10. Client redirigé vers /commandes/[id]
```

### Flux admin commande

```
Admin reçoit notification → va sur /admin/commandes
→ Change statut (confirmed → processing → shipped → delivered)
→ Chaque changement envoie une notification FCM au client
```

---

## 📱 PWA

### Configuration `next-pwa`

```ts
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})
```

### `manifest.json` (public/)

```json
{
  "name": "Nom de la boutique",
  "short_name": "Boutique",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#...",
  "orientation": "portrait",
  "icons": [...]
}
```

---

## 📋 Ordre d'implémentation recommandé

1. **Setup** — `create-next-app`, configuration TypeScript/Tailwind/shadcn
2. **DB** — Schéma Drizzle complet + migrations Supabase
3. **Auth** — Supabase Auth (inscription, connexion, middleware de protection)
4. **RLS** — Politiques Supabase sur toutes les tables
5. **Storage** — Buckets Supabase (products, avatars)
6. **Products** — CRUD admin + liste/détail vitrine
7. **Categories** — CRUD admin + navigation vitrine
8. **Cart** — Store Zustand + persistance
9. **Delivery** — Options livraison admin + sélection checkout
10. **PVIT** — Token manager + initiate + webhook + KYC + check-status
11. **Checkout** — Tunnel complet
12. **Orders** — Suivi client + gestion admin
13. **Notifications** — FCM setup + envoi sur events
14. **Dashboard** — Stats et analytics admin
15. **PWA** — Manifest + service worker + optimisations
16. **SEO** — Metadata, sitemap, robots.txt
17. **Déploiement** — Vercel + variables d'env + cron jobs

---

## ⚠️ Points d'attention critiques

1. **PVIT Webhook idempotence** — Toujours vérifier `merchant_reference_id` avant de traiter un callback. Un même webhook peut arriver plusieurs fois.

2. **PVIT Token rotation** — La clé `X-Secret` expire en 3600s. Le cron job doit tourner toutes les 50 minutes. Sans cela, tous les paiements échouent.

3. **Jamais de clés sensibles côté client** — `SUPABASE_SERVICE_ROLE_KEY`, `PVIT_API_PASSWORD` et `FIREBASE_SERVER_KEY` uniquement côté serveur.

4. **Snapshot des prix** — Au moment de créer une commande, toujours snapshot `unit_price`, `product_name`, `product_image` dans `order_items`. Un produit peut changer de prix après la commande.

5. **RLS activé** — Activer RLS sur toutes les tables Supabase sans exception.

6. **Prix en entiers** — Stocker tous les prix en **FCFA entiers** (pas de centimes). `5000` = 5 000 FCFA. Pas de float.

7. **Livraison** — Le `delivery_fee` doit être snapshot dans la commande, pas recalculé a posteriori.

8. **PVIT Fallback** — Si le webhook n'arrive pas, le client peut manuellement rafraîchir le statut via Check Status API. Ne jamais laisser une commande bloquée en `pending` indéfiniment.
