import { redirect } from 'next/navigation'

import { AdminShell } from '@/components/admin/admin-shell'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/connexion?redirectTo=/admin')
  }
  if (user.role !== 'admin') {
    redirect('/')
  }

  return <AdminShell user={user}>{children}</AdminShell>
}
