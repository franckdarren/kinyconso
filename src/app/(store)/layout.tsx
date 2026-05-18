import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
