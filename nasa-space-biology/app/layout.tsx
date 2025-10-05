import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/header'
import { APIProvider } from '@/APIContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stellar Mind AI',
  description: 'Created by Stellar Minds',
  generator: 'stellar.mind.ai',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <APIProvider>
          <Header />
          <div className="pt-16">
            {children}
          </div>
        </APIProvider>
        <Analytics />
      </body>
    </html>
  )
}
