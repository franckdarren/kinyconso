import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tableau de bord admin',
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
      <p className="text-muted-foreground text-sm">
        Statistiques et indicateurs de votre boutique. Les graphiques arrivent en Phase 15.
      </p>
    </div>
  )
}
