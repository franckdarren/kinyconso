# Intégration PVIT — Paiement

## Architecture

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

## Opérateurs supportés

| Opérateur       | Code PVIT         |
| --------------- | ----------------- |
| Airtel Money    | `AIRTEL_MONEY`    |
| Moov Money      | `MOOV_MONEY`      |
| Visa/Mastercard | `VISA_MASTERCARD` |

## Gestion de la clé X-Secret

- La clé expire toutes les **3600 secondes**
- Cron job Vercel `/api/cron/pvit-token` toutes les **50 minutes**
- Stockée dans Supabase table `app_config` ou variable d'env dynamique
- **Jamais exposée côté client**

## Idempotence du webhook

```ts
// webhook-handler.ts
const existing = await db.query.payments.findFirst({
  where: eq(payments.merchantReferenceId, payload.merchantReferenceId),
})
if (existing?.status !== 'pending') {
  return { transactionId: payload.transactionId, responseCode: payload.code }
}
```

Un même webhook peut arriver plusieurs fois — toujours vérifier avant de traiter.

## Fallback Check Status

Si le webhook n'arrive pas dans les **3 minutes**, le client appelle :
`/api/pvit/check-status?reference=XXX` → interroge directement l'API PVIT.

Ne jamais laisser une commande bloquée en `pending` indéfiniment.

## Routes API (server-side uniquement)

```
/api/pvit/initiate/route.ts    → Initier un paiement
/api/pvit/callback/route.ts    → Webhook PVIT
/api/pvit/check-status/route.ts
/api/pvit/kyc/route.ts
/api/cron/pvit-token/route.ts  → Renouvellement X-Secret
```

## Flux commande complet

```
1. Client ajoute produits au panier (Zustand)
2. Saisit adresse de livraison
3. Sélectionne option de livraison → prix mis à jour
4. Sélectionne opérateur PVIT (Airtel / Moov / Visa)
5. Saisit numéro de téléphone (ou infos carte)
6. Clic "Payer" → Server Action createOrder() :
   a. Valide le panier
   b. Crée la commande en DB (status: pending)
   c. Crée le paiement en DB (status: pending)
   d. Génère merchant_reference_id (crypto.randomUUID())
   e. Appelle PVIT API → reçoit PENDING
7. Client voit "Paiement en cours..."
8. PVIT webhook → /api/pvit/callback
   → Update payment + order status
   → Notification FCM push
9. Client redirigé vers /commandes/[id]
```
