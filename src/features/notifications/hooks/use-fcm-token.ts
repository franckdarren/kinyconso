'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import {
  getFcmToken,
  getNotificationPermission,
  onForegroundMessage,
  requestNotificationPermission,
  type FcmPermissionState,
} from '../fcm/client'
import { registerFcmToken } from '../actions/register-fcm-token'

interface UseFcmTokenOptions {
  enabled: boolean
  onForegroundMessage?: (payload: {
    title: string
    body: string
    data: Record<string, string>
  }) => void
}

interface UseFcmTokenResult {
  permission: FcmPermissionState
  isSupported: boolean
  enable: () => Promise<void>
  isPending: boolean
}

function subscribeToPermission(callback: () => void): () => void {
  if (
    typeof navigator === 'undefined' ||
    !('permissions' in navigator) ||
    typeof navigator.permissions?.query !== 'function'
  ) {
    return () => {}
  }
  let cleanup: (() => void) | undefined
  navigator.permissions
    .query({ name: 'notifications' as PermissionName })
    .then((status) => {
      const handler = () => callback()
      status.addEventListener('change', handler)
      cleanup = () => status.removeEventListener('change', handler)
    })
    .catch(() => {})
  return () => cleanup?.()
}

const PERMISSION_SSR_SNAPSHOT: FcmPermissionState = 'default'

/**
 * Hook qui orchestre l'enregistrement FCM côté client.
 *
 * Le hook est passif : l'utilisateur doit appeler `enable()` (typiquement
 * depuis un bouton dans le centre de notifications) pour déclencher le
 * prompt navigateur. Si la permission a déjà été accordée lors d'une visite
 * précédente, on régénère silencieusement le token et on l'enregistre côté
 * serveur.
 */
export function useFcmToken({
  enabled,
  onForegroundMessage: onMessage,
}: UseFcmTokenOptions): UseFcmTokenResult {
  const permission = useSyncExternalStore<FcmPermissionState>(
    subscribeToPermission,
    () => getNotificationPermission(),
    () => PERMISSION_SSR_SNAPSHOT,
  )
  const [isPending, setIsPending] = useState(false)
  const registeredTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (permission !== 'granted') return
    void (async () => {
      const tok = await getFcmToken()
      if (!tok || registeredTokenRef.current === tok) return
      const result = await registerFcmToken(tok)
      if (result.success) {
        registeredTokenRef.current = tok
      }
    })()
  }, [enabled, permission])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let unsub: (() => void) | undefined
    void onForegroundMessage((payload) => {
      if (cancelled) return
      const data: Record<string, string> = {}
      if (payload.data) {
        for (const [k, v] of Object.entries(payload.data)) {
          if (typeof v === 'string') data[k] = v
        }
      }
      onMessage?.({
        title: payload.notification?.title ?? 'KinyConso',
        body: payload.notification?.body ?? '',
        data,
      })
    }).then((fn) => {
      if (cancelled) {
        fn()
      } else {
        unsub = fn
      }
    })
    return () => {
      cancelled = true
      unsub?.()
    }
  }, [enabled, onMessage])

  const enable = useCallback(async () => {
    setIsPending(true)
    try {
      await requestNotificationPermission()
    } finally {
      setIsPending(false)
    }
  }, [])

  return {
    permission,
    isSupported: permission !== 'unsupported',
    enable,
    isPending,
  }
}
