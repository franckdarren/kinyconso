import Link from 'next/link'

import { siteConfig } from '@/config/site'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-primary inline-block text-2xl font-bold tracking-tight">
            {siteConfig.name}
          </Link>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
