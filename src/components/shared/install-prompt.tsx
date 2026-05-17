'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa-install-dismissed'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!sessionStorage.getItem(DISMISSED_KEY)) {
        setVisible(true)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    setVisible(false)
    sessionStorage.setItem(DISMISSED_KEY, '1')
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Installer KinyConso"
      className="bg-card fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-sm rounded-xl border p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white select-none">
          KC
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="text-sm font-semibold">Installer KinyConso</p>
          <p className="text-muted-foreground text-xs">
            Ajoutez l&apos;app sur votre écran d&apos;accueil pour un accès rapide.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
          aria-label="Fermer la bannière d'installation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleDismiss}>
          Plus tard
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
          onClick={handleInstall}
        >
          <Download className="h-3.5 w-3.5" />
          Installer
        </Button>
      </div>
    </div>
  )
}
