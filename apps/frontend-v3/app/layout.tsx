/* eslint-disable max-len */
import { Metadata } from 'next'
import { Providers } from './providers'
import { Navbar } from '@/lib/shared/components/navs/Navbar'
import { Footer } from '@/lib/shared/components/navs/Footer'
import { getProjectConfig } from '@/lib/config/getProjectConfig'
import { satoshiFont } from '@/lib/assets/fonts/satoshi/satoshi'
import NextTopLoader from 'nextjs-toploader'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@/lib/assets/css/global.css'
import { Fathom } from '@/lib/shared/services/fathom/Fathom'
import { GlobalAlerts } from '@/lib/shared/components/navs/GlobalAlerts'

const { projectName } = getProjectConfig()

export const metadata: Metadata = {
  title: `${projectName} DeFi Liquidity Pools`,
  description: `Explore DeFi liquidity pools and swap tokens. Provide liquidity to accumulate yield from swap fees while retaining your token exposure as prices move.`,
  icons: [
    { rel: 'icon', type: 'image/x-icon', url: '/favicon.ico' },
    {
      rel: 'icon',
      type: 'image/png',
      url: '/favicon-light.png',
      media: '(prefers-color-scheme: light)',
    },
    {
      rel: 'icon',
      type: 'image/png',
      url: '/favicon-dark.png',
      media: '(prefers-color-scheme: dark)',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://w.appzi.io/w.js?token=8TY8k" />
      </head>
      <body
        className={satoshiFont.className}
        suppressHydrationWarning
        style={{ marginRight: '0px !important' }} // Required to prevent layout shift introduced by Rainbowkit
      >
        <Fathom />
        <NextTopLoader showSpinner={false} color="#7f6ae8" />
        <Providers>
          <GlobalAlerts />
          <Navbar />
          {children}
          <Footer />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}
