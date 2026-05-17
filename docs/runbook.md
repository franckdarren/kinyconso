# Runbook KinyConso — Guide opérationnel

Ce document décrit les procédures à suivre face aux incidents les plus courants en production.

---

## 1. Les paiements échouent tous

### Diagnostic rapide

1. Ouvrir `/admin/health` → vérifier le statut **PVIT (X-Secret)**
2. Si statut `Hors service` ou `Dégradé` → le token est expiré ou absent

### Résolution — renouveler le token PVIT manuellement

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://kinyconso.vercel.app/api/cron/pvit-token
```

Réponse attendue : `{ "success": true, "expiresAt": "..." }`

Si le cron échoue :

- Vérifier que `PVIT_URL_CODE`, `PVIT_OPERATION_ACCOUNT_CODE` et `PVIT_API_PASSWORD` sont bien renseignés dans les variables Vercel
- Consulter les logs Vercel → `Functions` → `/api/cron/pvit-token`
- Contacter le support PVIT si l'API retourne `401` ou `403`

### Prévention

Le cron `/api/cron/pvit-token` tourne toutes les 50 minutes. Le token expire après 3600 s (60 min). Si le cron est en échec plusieurs fois d'affilée, Vercel envoie une alerte email.

---

## 2. Une commande est bloquée en `pending`

Une commande reste `pending` si le callback PVIT n'est jamais arrivé (timeout réseau, bug du webhook).

### Résolution — forcer la vérification du statut

```bash
curl -X GET \
  "https://kinyconso.vercel.app/api/pvit/check-status?merchantReferenceId=REF_ICI" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

La route interroge PVIT et met à jour la commande si le paiement a réellement réussi.

### Résolution — cleanup automatique

Les commandes restées `pending` plus de 30 minutes sont automatiquement annulées par le cron toutes les heures :

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://kinyconso.vercel.app/api/cron/cleanup-pending-orders
```

Réponse : `{ "success": true, "cancelled": N }`

### Note : stock non décrémenté

Le stock n'est décrémenté qu'à la transition `pending → confirmed`. Annuler une commande `pending` ne nécessite pas de réincrément.

---

## 3. Renvoyer une notification push à un client

Depuis Supabase Studio (SQL Editor) :

```sql
-- Trouver le token FCM du client
SELECT id, full_name, fcm_token FROM users WHERE id = 'USER_UUID';

-- Marquer une notification comme non lue pour la réafficher
UPDATE notifications
SET is_read = false
WHERE user_id = 'USER_UUID'
  AND id = 'NOTIF_UUID';
```

Depuis le code, appeler `sendNotification()` directement dans une Server Action :

```ts
await sendNotification({
  userId: 'USER_UUID',
  type: 'order_confirmed',
  title: 'Commande confirmée',
  body: 'Votre commande CMD-2026-00042 est confirmée.',
  data: { orderId: 'ORDER_UUID', orderNumber: 'CMD-2026-00042', status: 'confirmed' },
})
```

---

## 4. Erreurs remontées dans Sentry

1. Ouvrir [sentry.io](https://sentry.io) → project **kinyconso**
2. Identifier l'exception et l'endpoint concerné
3. Consulter le breadcrumb pour reconstituer le contexte
4. Si l'erreur est dans `/api/pvit/callback` → vérifier l'idempotence (`merchant_reference_id` déjà traité ?)
5. Si l'erreur est dans `/api/pvit/initiate` → vérifier le token PVIT et les variables d'env

---

## 5. Restaurer un backup Supabase

1. Ouvrir le dashboard Supabase → **Database** → **Backups**
2. Sélectionner le backup souhaité (quotidien, automatique)
3. Cliquer sur **Restore** et confirmer
4. Après restauration, re-appliquer les migrations éventuellement non incluses :
   ```bash
   npx drizzle-kit push
   ```
5. Vérifier que les données sont cohérentes via Supabase Studio

> Tester la restauration sur un projet Supabase de staging avant de l'appliquer en production.

---

## 6. Déployer une mise à jour d'urgence

```bash
# Sur la branche main
git push origin main
```

Vercel déclenche automatiquement un déploiement. Si le build échoue :

```bash
# Voir les logs de build
vercel logs --prod
```

Pour revenir à la version précédente :

1. Ouvrir Vercel dashboard → **Deployments**
2. Trouver le dernier déploiement stable
3. Cliquer sur **Promote to Production**

---

## 7. Variables d'environnement manquantes en production

Si une variable est manquante, l'app crashe au démarrage avec une erreur explicite.

1. Ouvrir Vercel → **Settings** → **Environment Variables**
2. Ajouter la variable manquante (choisir **Production** + **Preview**)
3. Redéployer : `vercel --prod` ou via l'interface

Liste complète des variables requises : voir [`.env.example`](../.env.example)

---

## 8. Commandes en statut incohérent (bug machine à états)

Si une commande a un statut impossible (ex: `delivered` → `pending`), corriger directement en SQL :

```sql
-- ATTENTION : opération irréversible, noter le statut précédent d'abord
UPDATE orders
SET status = 'confirmed', updated_at = now()
WHERE id = 'ORDER_UUID';
```

Ensuite notifier manuellement le client si nécessaire (voir section 3).

---

## Contacts utiles

| Service          | Contact                      |
| ---------------- | ---------------------------- |
| PVIT support     | support@pvit.ga              |
| Supabase support | https://supabase.com/support |
| Vercel support   | https://vercel.com/help      |
| Sentry           | https://sentry.io/support    |
