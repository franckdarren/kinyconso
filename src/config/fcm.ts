/**
 * Configuration Firebase Cloud Messaging (FCM).
 *
 * - La partie `firebaseClientConfig` est publique et utilisée pour initialiser
 *   le SDK Firebase côté client + Service Worker. Elle peut être exposée
 *   au bundle public sans risque (clés API publiques scopées par FCM).
 * - La partie service-account (`getFcmServerEnv`) est strictement server-only
 *   et ne doit jamais transiter par le bundle client.
 *
 * Documentation : https://firebase.google.com/docs/cloud-messaging/migrate-v1
 */

export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
} as const

export const FCM_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? ''

export const FCM_SERVICE_WORKER_PATH = '/firebase-messaging-sw.js'

export function isFcmConfigured(): boolean {
  return Boolean(
    firebaseClientConfig.apiKey &&
    firebaseClientConfig.projectId &&
    firebaseClientConfig.messagingSenderId &&
    firebaseClientConfig.appId &&
    FCM_VAPID_KEY,
  )
}

export interface FcmServerEnv {
  projectId: string
  clientEmail: string
  privateKey: string
}

/**
 * Retourne les credentials du service account FCM côté serveur.
 * Lance une erreur explicite si l'une des variables manque, mais reste
 * utilisée avec un try/catch pour ne pas bloquer la transition de
 * commande quand FCM n'est pas configuré (mode dev).
 */
export function getFcmServerEnv(): FcmServerEnv {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error(
      'Variables FCM manquantes : NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY sont requises.',
    )
  }

  const privateKey = rawKey.replace(/\\n/g, '\n')

  return { projectId, clientEmail, privateKey }
}

export const FCM_HTTP_V1_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'

export function fcmHttpV1Endpoint(projectId: string): string {
  return `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`
}
