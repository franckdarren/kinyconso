# Roadmap d'implémentation — KinyConso

Roadmap phasée pour la réalisation complète de la PWA e-commerce. Chaque phase a des **livrables concrets** et des **critères d'acceptation** vérifiables. Les phases sont séquentielles sauf indication contraire.

Légende :

- 🎯 Objectif
- 📦 Livrables
- ✅ Critères d'acceptation
- 🔗 Dépend de

---

## Phase 0 — Préparation projet

🎯 Mettre en place les fondations du repo et les comptes externes.

📦 Livrables

- Projet Next.js 16+ créé avec App Router + TypeScript strict
- Repo Git initialisé, branche `main` protégée
- Compte Supabase créé + projet provisionné (région la plus proche)
- Compte PVIT créé + credentials de test obtenus
- Compte Firebase créé + projet FCM configuré
- Compte Vercel lié au repo GitHub
- Fichier `.env.local` complet (voir CLAUDE.md)
- Fichier `.env.example` versionné (sans valeurs)

✅ Critères

- `npm run dev` démarre sans erreur
- Variables d'env documentées
- README minimal présent

---

## Phase 1 — Fondations techniques

🎯 Configurer l'outillage de qualité de code et la structure du projet.

📦 Livrables

- ESLint + Prettier configurés (règles strictes)
- `tsconfig.json` en mode strict (`strict: true`, `noUncheckedIndexedAccess: true`)
- Path aliases (`@/*` → `src/*`)
- Tailwind CSS configuré avec thème custom (primary/secondary/accent)
- shadcn/ui installé + composants de base (Button, Input, Dialog, Form, Toast, Select)
- Structure de dossiers `src/` complète (voir CLAUDE.md)
- Husky + lint-staged pour pre-commit (typecheck + lint)
- Layout racine avec metadata SEO de base
- `lib/utils/cn.ts` + `format-price.ts` + `slugify.ts` + `generate-reference.ts`

✅ Critères

- `npm run build` passe sans erreur
- `npm run lint` passe
- Pre-commit hook fonctionne
- Page d'accueil minimale s'affiche avec Tailwind appliqué

🔗 Phase 0

---

## Phase 2 — Base de données

🎯 Schéma complet en production sur Supabase via Drizzle.

📦 Livrables

- Drizzle ORM installé + `drizzle.config.ts`
- Schémas Drizzle complets dans `db/schema/` (voir `docs/schema.md`) :
  - `users`, `categories`, `products`, `delivery_options`, `orders`, `order_items`, `payments`, `cart`, `notifications`
  - Table `app_config` (pour X-Secret PVIT)
- Enums PostgreSQL créés (`user_role`, `order_status`, `payment_status`, `payment_operator`, `notification_type`)
- Migrations générées et appliquées sur Supabase
- Trigger SQL `set_updated_at()` sur toutes les tables avec `updated_at`
- Trigger SQL pour créer automatiquement une ligne `users` à chaque insertion dans `auth.users`
- Trigger SQL pour générer `order_number` automatiquement (format `CMD-YYYY-NNNNN`)
- Indexes sur les colonnes filtrées fréquemment (`slug`, `category_id`, `user_id`, `status`, `merchant_reference_id`)
- Seed data : 5 catégories, 20 produits, 3 options de livraison
- Clients Drizzle : `db/index.ts` (server) + helpers query/transaction

✅ Critères

- `npx drizzle-kit push` fonctionne
- Toutes les FK et contraintes en place
- Seed exécutable via `npm run db:seed`
- Données visibles dans Supabase Studio

🔗 Phase 1

---

## Phase 3 — Row Level Security (RLS)

🎯 Sécuriser toutes les tables avec les bonnes politiques.

📦 Livrables

- RLS activé sur **toutes** les tables (`alter table ... enable row level security`)
- Politiques pour `users` : SELECT/UPDATE de son propre profil
- Politiques pour `products`, `categories`, `delivery_options` : SELECT public, INSERT/UPDATE/DELETE admin only
- Politiques pour `orders`, `order_items` : SELECT propre commande pour client, ALL pour admin
- Politiques pour `payments` : aucune lecture client (admin only)
- Politiques pour `cart` : ALL sur son propre panier
- Politiques pour `notifications` : SELECT/UPDATE ses propres notifications
- Helper SQL `is_admin()` (vérifie `users.role = 'admin'`)
- Tests RLS via Supabase Studio en simulant des rôles

✅ Critères

- Un utilisateur connecté ne peut accéder qu'à ses propres données
- Un anonyme ne peut lire que `products`, `categories`, `delivery_options`
- Un admin peut tout faire
- Les routes API server-side utilisent `SUPABASE_SERVICE_ROLE_KEY` pour bypass

🔗 Phase 2

---

## Phase 4 — Authentification

🎯 Inscription, connexion, déconnexion, protection des routes.

📦 Livrables

- Clients Supabase : `lib/supabase/client.ts`, `server.ts`, `admin.ts`
- Middleware Next.js (`middleware.ts`) pour rafraîchir la session sur chaque requête
- Pages :
  - `/auth/connexion` (email + password)
  - `/auth/inscription` (email + password + nom complet + téléphone)
  - `/auth/mot-de-passe-oublie`
  - `/auth/reinitialisation`
- Route handler `/auth/callback/route.ts` pour OAuth/magic links
- Server Actions `features/auth/actions/` : `signIn`, `signUp`, `signOut`, `requestPasswordReset`, `updatePassword`
- Schemas Zod pour chaque action
- Middleware de protection des routes `/admin/*` (redirige si non-admin)
- Middleware de protection `/commandes/*` (redirige si non connecté)
- Hook `useUser()` pour récupérer l'utilisateur courant
- Composant `UserMenu` (Header) avec état connecté/déconnecté

✅ Critères

- Inscription crée bien la ligne dans `auth.users` ET `users` (trigger)
- Connexion persiste la session après refresh
- Déconnexion vide la session
- Accès `/admin` redirige vers `/auth/connexion` si non admin
- Messages d'erreur en français

🔗 Phase 3

---

## Phase 5 — Storage Supabase

🎯 Upload et gestion des médias.

📦 Livrables

- Buckets créés :
  - `products` (public read)
  - `categories` (public read)
  - `avatars` (public read)
- Policies RLS sur les buckets (upload admin only pour products/categories)
- Helper `features/storage/actions/upload.ts` (compression côté client, upload server-side)
- Helper `features/storage/actions/delete.ts`
- Composant `ImageUploader` réutilisable (drag & drop + preview)
- Validation : taille max 5 Mo, formats `jpg/png/webp` uniquement
- Conversion automatique en WebP si possible

✅ Critères

- Upload depuis l'admin fonctionne
- URLs publiques accessibles
- Suppression nettoie bien le storage

🔗 Phase 4

---

## Phase 6 — Catalogue : Catégories

🎯 CRUD complet des catégories + navigation vitrine.

📦 Livrables

- Server Actions `features/categories/actions/` : `createCategory`, `updateCategory`, `deleteCategory`, `toggleActive`
- Queries `features/categories/queries/` : `getCategories`, `getCategoryBySlug`, `getActiveCategories`
- Pages admin :
  - `/admin/categories` (liste + actions inline)
  - `/admin/categories/nouvelle`
  - `/admin/categories/[id]/modifier`
- Composants : `CategoryForm`, `CategoryList`, `CategoryCard`
- Génération automatique du `slug` depuis le `name`
- Validation Zod (nom unique, slug unique)
- Page vitrine `/categories/[slug]` (liste des produits de la catégorie)
- Composant `CategoryNav` (header) avec catégories actives

✅ Critères

- Admin peut créer/modifier/supprimer/désactiver une catégorie
- Slug auto-généré et éditable
- Suppression bloquée si produits associés (ou cascade soft delete)
- Navigation publique fonctionne

🔗 Phase 5

---

## Phase 7 — Catalogue : Produits

🎯 CRUD complet des produits + liste/détail vitrine.

📦 Livrables

- Server Actions `features/products/actions/` : `createProduct`, `updateProduct`, `softDeleteProduct`, `toggleActive`, `toggleFeatured`, `updateStock`
- Queries `features/products/queries/` : `getProducts(filters)`, `getProductBySlug`, `getFeaturedProducts`, `getProductsByCategory`
- Pages admin :
  - `/admin/produits` (liste paginée + filtres + recherche)
  - `/admin/produits/nouveau`
  - `/admin/produits/[id]/modifier`
- Composants admin : `ProductForm` (avec multi-upload images), `ProductsTable`
- Composants vitrine : `ProductCard`, `ProductGrid`, `ProductDetail`, `ProductGallery`, `PriceTag`
- Pages vitrine :
  - `/produits` (catalogue + filtres : catégorie, prix, recherche)
  - `/produits/[slug]` (détail avec galerie, ajout panier)
  - `/` (accueil avec produits en vedette + catégories)
- Pagination ou infinite scroll sur le catalogue
- `generateStaticParams` + ISR sur les pages produits/catégories
- `generateMetadata` SEO complet (title, description, OG image)

✅ Critères

- CRUD produits fonctionne
- Soft delete respecté (filtre `deleted_at IS NULL`)
- Recherche full-text fonctionnelle
- Filtres combinables (catégorie + prix + recherche)
- Détail produit charge en < 1s

🔗 Phase 6

---

## Phase 8 — Panier

🎯 Panier client-side persistant avec sync optionnelle.

📦 Livrables

- Store Zustand `stores/cart.store.ts` avec persistance `localStorage`
- Actions : `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getSubtotal`, `getItemCount`
- Hook `useCart()` exposant l'API
- Composants :
  - `CartDrawer` (slide-over latéral)
  - `CartItem` (ligne produit + quantité + suppression)
  - `CartSummary` (totaux)
  - `CartBadge` (header avec compteur)
- Page `/panier` (vue complète)
- Server Action `syncCart` (sauvegarde server-side si utilisateur connecté)
- Hydration sécurisée (éviter mismatch SSR/client)
- Re-validation des prix au moment du checkout (un produit peut avoir changé)
- Gestion du stock (bloquer ajout si `stock_quantity` insuffisant)

✅ Critères

- Panier persiste après refresh
- Panier se synchronise entre devices si utilisateur connecté
- Ajout/suppression instantané (optimistic)
- Alerte si un produit du panier devient indisponible

🔗 Phase 7

---

## Phase 9 — Livraison

🎯 Options de livraison configurables par l'admin.

📦 Livrables

- Server Actions `features/delivery/actions/` : CRUD complet
- Queries : `getActiveDeliveryOptions`, `getDeliveryOptionById`
- Page admin `/admin/livraisons` (liste + CRUD)
- Composant `DeliverySelector` (radio cards) pour le checkout
- Affichage : nom, description, prix, délai estimé
- Tri par `sort_order`
- Snapshot du prix dans la commande au moment du checkout

✅ Critères

- Admin peut créer/modifier/désactiver les options
- Le sélecteur n'affiche que les options actives
- Le prix est snapshot dans `orders.delivery_fee`

🔗 Phase 8

---

## Phase 10 — PVIT : Infrastructure

🎯 Token manager et wrapper API PVIT.

📦 Livrables

- Table `app_config` (clé/valeur) pour stocker `pvit_x_secret` + `pvit_secret_expires_at`
- `features/payments/pvit/token-manager.ts` :
  - `getValidToken()` : retourne le token ou en demande un nouveau si expiré
  - `refreshToken()` : appelle PVIT pour obtenir un nouveau X-Secret
- Route cron `/api/cron/pvit-token/route.ts` protégée par `CRON_SECRET`
- Configuration Vercel Cron dans `vercel.json` (toutes les 50 minutes)
- `features/payments/pvit/client.ts` : wrapper HTTP typé pour l'API PVIT
- `features/payments/pvit/types.ts` : types complets (requests + responses)
- `lib/utils/generate-reference.ts` : génération `merchant_reference_id` via `crypto.randomUUID()`
- Logs structurés (request/response) pour debug PVIT

✅ Critères

- Le cron tourne et renouvelle bien le X-Secret
- Le client PVIT gère automatiquement la rotation du token
- Aucune clé sensible dans le bundle client (`npm run build` + vérification)

🔗 Phase 9 — Voir [docs/pvit.md](pvit.md)

---

## Phase 11 — PVIT : Paiement complet

🎯 Initiation paiement + webhook + fallback.

📦 Livrables

- Route `/api/pvit/initiate/route.ts` :
  - Valide la requête (auth + panier + livraison)
  - Crée `orders` (status: pending) + `order_items` (snapshots) + `payments` (status: pending)
  - Appelle PVIT et stocke `pvit_transaction_id`
  - Retourne la référence et le statut au client
- Route `/api/pvit/callback/route.ts` :
  - Vérifie l'origine (IP whitelist si possible)
  - Idempotence stricte sur `merchant_reference_id`
  - Met à jour `payments.status` + `orders.status`
  - Décrémente `products.stock_quantity` si success
  - Déclenche notification FCM
  - Stocke `raw_callback_payload`
  - Répond `{ transactionId, responseCode }`
- Route `/api/pvit/check-status/route.ts` (fallback) :
  - Interroge PVIT par `merchant_reference_id`
  - Met à jour la DB si statut différent
- Route `/api/pvit/kyc/route.ts`
- Tests manuels avec sandbox PVIT (Airtel, Moov, Visa)
- Gestion des cas d'erreur : timeout, paiement refusé, fraude

✅ Critères

- Un paiement réussi met à jour la commande en `confirmed`
- Un paiement échoué laisse la commande en `pending` avec possibilité de retry
- Le webhook est idempotent (testé en rejouant le même payload)
- Le check-status débloque une commande bloquée
- Aucune commande ne reste en `pending` > 5 min sans diagnostic

🔗 Phase 10

---

## Phase 12 — Checkout

🎯 Tunnel de paiement complet, mobile-first.

📦 Livrables

- Page `/checkout` en 3 étapes :
  1. Adresse de livraison (pré-remplie depuis `users` si connecté)
  2. Option de livraison + récap
  3. Opérateur PVIT + numéro de téléphone (ou carte)
- Composants : `CheckoutForm`, `DeliverySelector`, `OperatorSelector`, `OrderSummary`, `PaymentMethodForm`
- Validation Zod par étape
- Server Action `createOrder` orchestrant toute la création
- Écran de transition « Paiement en cours… » avec polling sur le statut
- Redirection vers `/commandes/[id]` une fois confirmé
- Gestion erreur : retour avec message clair + panier préservé
- Création d'un compte « invité » optionnel (si pas connecté)

✅ Critères

- Un client peut payer en moins de 5 clics depuis le panier
- L'écran mobile est entièrement utilisable (touch targets ≥ 44px)
- Les erreurs de paiement reviennent sur l'étape concernée sans perdre les données

🔗 Phase 11

---

## Phase 13 — Commandes

🎯 Suivi client + gestion admin.

📦 Livrables

- Queries `features/orders/queries/` : `getOrderById`, `getUserOrders`, `getAllOrders(filters)`
- Server Actions admin : `updateOrderStatus`, `cancelOrder`, `refundOrder`, `addOrderNote`
- Pages client :
  - `/commandes/[id]` (détail + statut visuel + items + adresse + total)
  - `/compte/commandes` (historique paginé)
- Pages admin :
  - `/admin/commandes` (liste filtrable par statut/date/client)
  - `/admin/commandes/[id]` (détail + changement statut + notes internes)
- Composants : `OrderList`, `OrderDetail`, `OrderStatusBadge`, `OrderTimeline`
- Transitions de statut autorisées strictes (machine à états)
- Chaque changement de statut déclenche une notification FCM au client

✅ Critères

- Client voit ses commandes et leur statut en temps réel (Supabase Realtime optionnel)
- Admin peut faire évoluer les statuts dans le bon ordre uniquement
- Statut `cancelled` réincrémente le stock

🔗 Phase 12

---

## Phase 14 — Notifications FCM

🎯 Push notifications web temps réel.

📦 Livrables

- Service worker FCM (`public/firebase-messaging-sw.js`)
- `features/notifications/fcm/client.ts` : init Firebase, demande de permission, récupération token
- `features/notifications/fcm/send.ts` : envoi server-side via FCM HTTP v1
- Hook `useFcmToken()` : enregistre le token dans `users.fcm_token` au login
- Helper `sendNotification(userId, payload)` :
  - Insère dans `notifications` (DB)
  - Envoie push FCM si token disponible
- Triggers automatiques sur :
  - `order_confirmed` (paiement success)
  - `order_shipped`, `order_delivered` (changement statut)
  - `payment_failed`
- Composant `NotificationCenter` (header avec compteur non lues)
- Page `/compte/notifications` (historique + marquer comme lu)

✅ Critères

- Le client reçoit une notification après paiement réussi
- Les notifications fonctionnent en arrière-plan (PWA installée)
- Le centre de notifications affiche l'historique complet

🔗 Phase 13

---

## Phase 15 — Dashboard admin

🎯 Vue d'ensemble et analytics.

📦 Livrables

- Page `/admin` avec :
  - `StatsCards` : CA jour/semaine/mois, nb commandes, nb clients, panier moyen
  - `RevenueChart` : CA sur 30 jours (Recharts ou Tremor)
  - `RecentOrders` : 10 dernières commandes
  - `TopProducts` : 5 produits les plus vendus
  - `LowStock` : produits avec stock < seuil
- Queries optimisées (vues SQL ou requêtes agrégées Drizzle)
- Page `/admin/clients` (liste clients + détail + historique commandes)
- Filtres temporels (jour, semaine, mois, custom)

✅ Critères

- Le dashboard charge en < 2s
- Les chiffres sont cohérents avec la DB
- Mobile-friendly

🔗 Phase 14

---

## Phase 16 — PWA

🎯 Application installable et offline-friendly.

📦 Livrables

- `next-pwa` installé et configuré dans `next.config.ts` :
  ```ts
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  })
  ```
- `public/manifest.json` complet :
  ```json
  {
    "name": "KinyConso",
    "short_name": "KinyConso",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#...",
    "orientation": "portrait",
    "icons": [
      { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
      {
        "src": "/icons/icon-maskable.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      }
    ]
  }
  ```
- Icônes générées (192, 512, maskable, Apple touch)
- Splash screens iOS
- Stratégies de cache :
  - `NetworkFirst` pour les pages dynamiques
  - `CacheFirst` pour les images et assets statiques
  - Pas de cache pour `/api/pvit/*`
- Composant `InstallPrompt` (bannière custom)
- Page offline fallback `/offline`
- Test sur iOS Safari + Android Chrome

✅ Critères

- Lighthouse PWA score > 90
- L'app est installable sur Android et iOS
- L'app fonctionne en mode offline (navigation des pages déjà visitées)

🔗 Phase 15

---

## Phase 17 — SEO

🎯 Référencement optimal.

📦 Livrables

- `generateMetadata` sur toutes les pages publiques
- Open Graph + Twitter Cards
- Structured Data JSON-LD :
  - `Product` sur les fiches produits
  - `Organization` sur l'accueil
  - `BreadcrumbList` sur la navigation
- `app/sitemap.ts` (génération dynamique depuis la DB)
- `app/robots.ts`
- Balises canoniques
- `hreflang="fr"` partout
- Compression images (`next/image` + AVIF)
- Sitemap soumis à Google Search Console

✅ Critères

- Lighthouse SEO score > 95
- Sitemap accessible à `/sitemap.xml`
- Les fiches produits ont des rich snippets valides (test Google)

🔗 Phase 16

---

## Phase 18 — Performance & Polish

🎯 Optimiser les Core Web Vitals et l'UX.

📦 Livrables

- Audit Lighthouse mobile : objectif > 90 sur toutes les métriques
- Lazy loading systématique des images hors viewport
- Skeletons / loading states sur toutes les listes
- Error boundaries (`error.tsx` + `not-found.tsx` par route group)
- Bundle analysis (`@next/bundle-analyzer`) → suppression des deps inutiles
- Préchargement intelligent (`<Link prefetch>`)
- Fonts auto-hébergées avec `next/font`
- Compression Brotli activée
- Toast `sonner` pour les feedbacks utilisateurs
- États vides (empty states) sur chaque liste
- Animations légères (Framer Motion sur éléments clés uniquement)

✅ Critères

- LCP < 2.5s sur 4G simulé
- CLS < 0.1
- FID < 100ms
- Bundle JS initial < 200 Ko gzippé

🔗 Phase 17

---

## Phase 19 — Tests & QA

🎯 Garantir la non-régression sur les flux critiques.

📦 Livrables

- Vitest configuré pour les tests unitaires
  - `lib/utils/` : 100% coverage
  - Schemas Zod : tests de validation
  - Token manager PVIT : tests avec mocks
- Playwright pour les tests E2E :
  - Inscription → connexion → ajout panier → checkout → paiement (sandbox PVIT)
  - Création produit admin → visible vitrine
  - Webhook PVIT idempotent (rejouer même payload)
- Tests RLS via Supabase test harness
- GitHub Actions CI : lint + typecheck + tests sur chaque PR

✅ Critères

- Tous les tests passent en CI
- Le flux de paiement E2E fonctionne en sandbox
- Aucune régression sur les bugs déjà corrigés

🔗 Phase 18

---

## Phase 20 — Déploiement production

🎯 Mise en production stable.

📦 Livrables

- Projet Vercel configuré
- Toutes les variables d'env de production saisies
- Cron jobs Vercel actifs (`vercel.json`) :
  - `/api/cron/pvit-token` toutes les 50 minutes
  - `/api/cron/cleanup-pending-orders` toutes les heures (annule les commandes pending > 30 min)
- Domaine custom configuré + HTTPS
- Webhook PVIT pointé sur l'URL de production
- Supabase : passage en plan payant si besoin + backups quotidiens activés
- Monitoring : Sentry (errors) + Vercel Analytics (perf)
- Logs structurés (pino ou équivalent)
- Page `/admin/health` : check des dépendances (DB, PVIT, FCM)
- Documentation runbook : que faire si paiements échouent, comment renvoyer une notif, etc.

✅ Critères

- Première commande réelle traitée avec succès
- Sentry capture bien les erreurs
- Backups Supabase fonctionnels (test de restauration)

🔗 Phase 19

---

## Phase 21 — Post-launch

🎯 Itération continue basée sur l'usage réel.

📦 Livrables (au fil de l'eau)

- Analytics produit (Plausible ou PostHog)
- Hotjar ou équivalent pour les heatmaps
- A/B testing sur la page checkout (Vercel Edge Config)
- Programme de fidélité / codes promo (table `coupons`)
- Avis clients sur les produits (table `reviews`)
- Recommandations produits (« vous aimerez aussi »)
- Recherche améliorée (Algolia ou Meilisearch si volume)
- Multi-vendeurs (si évolution business)
- Application mobile native (React Native + partage du backend)

---

## Récap des dépendances critiques

```
P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 → P10 → P11 → P12 → P13
                                                                       ↓
                                                                      P14
                                                                       ↓
                                                                      P15
                                                                       ↓
                                                                      P16 → P17 → P18 → P19 → P20 → P21
```

Phases parallélisables si plusieurs développeurs :

- P5 (Storage) peut démarrer en parallèle de P4 (Auth) une fois P3 fait
- P14 (Notifications) peut démarrer dès P11 (PVIT) terminé
- P15 (Dashboard) peut être développé en parallèle de P14
- P17 (SEO) et P18 (Perf) peuvent se faire en parallèle de P16 (PWA)

---

## Flux admin de référence

```
Admin reçoit notification de nouvelle commande
    ↓
/admin/commandes
    ↓
Détail commande → vérification stock + adresse
    ↓
Change statut : confirmed → processing → shipped → delivered
    ↓
Chaque transition envoie une notification FCM au client
```

Statuts terminaux : `delivered`, `cancelled`, `refunded` (pas de retour en arrière).
