import { Metadata } from 'next'
import { satoshiFont } from '@repo/lib/assets/fonts/satoshi/satoshi'
import NextTopLoader from 'nextjs-toploader'
import '@repo/lib/assets/css/global.css'
import { PropsWithChildren } from 'react'
import { Providers } from './providers'
import { ThemeProvider } from '@analytics/lib/services/chakra/ThemeProvider'
import { Navbar } from './_components/Navbar'
import { Footer } from './_components/Footer'

export const metadata: Metadata = {
  title: 'Balancer Analytics',
  description: 'Aggregated analytics across Balancer v2 and v3.',
  icons: [{ rel: 'icon', type: 'image/x-icon', url: '/favicon.ico' }],
  openGraph: {
    title: 'Balancer Analytics',
    description: 'Aggregated analytics across Balancer v2 and v3.',
    siteName: 'Balancer Analytics',
    type: 'website',
  },
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={satoshiFont.className}>
        <NextTopLoader color="#7f6ae8" showSpinner={false} />
        <ThemeProvider>
          <Providers>
            <Navbar />
            {children}
            <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
