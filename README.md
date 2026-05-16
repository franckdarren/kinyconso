# KinyConso

PWA e-commerce mobile-first pour le Gabon. Paiement Mobile Money (Airtel, Moov) et carte bancaire via PVIT. **Devise : FCFA uniquement. Interface en français.**

## Stack

- **Framework** : Next.js 16 (App Router) + React 19 + TypeScript strict
- **UI** : Tailwind CSS v4 + shadcn/ui
- **Base de données** : PostgreSQL (Supabase) + Drizzle ORM
- **Auth & Storage** : Supabase
- **Validation** : Zod
- **State** : Zustand
- **Paiement** : PVIT
- **Push** : Firebase Cloud Messaging
- **Déploiement** : Vercel

## Prérequis

- Node.js 20+
- npm 10+
- Un compte Supabase, PVIT et Firebase (voir `docs/`)

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Puis remplir les valeurs dans .env.local

# 3. Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Script                 | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Lance le serveur de développement              |
| `npm run build`        | Build de production                            |
| `npm run start`        | Démarre le serveur de production (après build) |
| `npm run lint`         | Vérifie le linting                             |
| `npm run lint:fix`     | Corrige automatiquement le linting             |
| `npm run format`       | Formate tous les fichiers avec Prettier        |
| `npm run format:check` | Vérifie le formatage sans modifier             |
| `npm run typecheck`    | Vérifie les types TypeScript                   |

## Structure

```
src/
├── app/          # Routes Next.js (App Router)
├── components/   # Composants partagés + UI shadcn
├── features/     # Logique métier par domaine
├── lib/          # Clients (Supabase) + utils
├── db/           # Schémas Drizzle + migrations
├── stores/       # Stores Zustand
├── hooks/        # Hooks React
├── types/        # Types globaux
└── config/       # Configuration (site, PVIT, FCM)
```

Voir [`CLAUDE.md`](CLAUDE.md) pour les conventions complètes.

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — Vue d'ensemble du projet
- [`docs/schema.md`](docs/schema.md) — Schéma de la base de données
- [`docs/pvit.md`](docs/pvit.md) — Intégration PVIT
- [`docs/implementation-order.md`](docs/implementation-order.md) — Roadmap d'implémentation

## Règles de sécurité

- **Jamais** de clé secrète (`SUPABASE_SERVICE_ROLE_KEY`, `PVIT_API_PASSWORD`, `FIREBASE_SERVER_KEY`) côté client.
- **RLS activé** sur toutes les tables Supabase.
- Toutes les routes `/api/pvit/*` sont server-side uniquement.
- Les `merchant_reference_id` sont générés avec `crypto.randomUUID()` côté serveur.
