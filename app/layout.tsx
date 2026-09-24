import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Nexus Store — ร้านขายไอเทมเกม',
  description: 'Nexus Store ร้านขายไอเทมเกมออนไลน์ ระบบอัตโนมัติ ใช้งานง่าย รองรับมือถือ',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
