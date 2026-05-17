'use client'

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging'

import { FCM_SERVICE_WORKER_PATH, FCM_VAPID_KEY, firebaseClientConfig } from '@/config/fcm'

let appPromise: Promise<FirebaseApp> | null = null
let messagingPromise: Promise<Messaging | null> | null = null
let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

async function getFirebaseApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    appPromise = Promise.resolve(getApps()[0] ?? initializeApp(firebaseClientConfig))
  }
  return appPromise
}

async function getMessagingInstance(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      if (typeof window === 'undefined') return null
      if (!(await isSupported().catch(() => false))) return null
      if (!firebaseClientConfig.apiKey || !FCM_VAPID_KEY) return null
      const app = await getFirebaseApp()
      return getMessaging(app)
    })()
  }
  return messagingPromise
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!swRegistrationPromise) {
    swRegistrationPromise = (async () => {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
      const params = new URLSearchParams({
        apiKey: firebaseClientConfig.apiKey,
        authDomain: firebaseClientConfig.authDomain,
        projectId: firebaseClientConfig.projectId,
        messagingSenderId: firebaseClientConfig.messagingSenderId,
        appId: firebaseClientConfig.appId,
      })
      const swUrl = `${FCM_SERVICE_WORKER_PATH}?${params.toString()}`
      try {
        return await navigator.serviceWorker.register(swUrl, { scope: '/' })
      } catch {
        return null
      }
    })()
  }
  return swRegistrationPromise
}

export type FcmPermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

export function getNotificationPermission(): FcmPermissionState {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<FcmPermissionState> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  const next = await Notification.requestPermission()
  return next
}

/**
 * Récupère le token FCM courant pour ce device. Renvoie null si :
 * - l'environnement n'est pas supporté (Safari iOS < 16.4, etc.)
 * - la permission a été refusée
 * - une erreur réseau / configuration empêche la récupération
 */
export async function getFcmToken(): Promise<string | null> {
  const messaging = await getMessagingInstance()
  if (!messaging) return null
  if (getNotificationPermission() !== 'granted') return null

  const swReg = await registerServiceWorker()
  try {
    return await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: swReg ?? undefined,
    })
  } catch {
    return null
  }
}

export async function removeFcmToken(): Promise<void> {
  const messaging = await getMessagingInstance()
  if (!messaging) return
  try {
    await deleteToken(messaging)
  } catch {
    // ignore
  }
}

/**
 * S'abonne aux messages reçus quand l'onglet est au premier plan.
 * Le SW gère les pushes en arrière-plan via `firebase-messaging-sw.js`.
 */
export async function onForegroundMessage(
  handler: (payload: MessagePayload) => void,
): Promise<() => void> {
  const messaging = await getMessagingInstance()
  if (!messaging) return () => {}
  return onMessage(messaging, handler)
}
