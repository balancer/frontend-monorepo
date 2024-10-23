/* eslint-disable max-len */
import { Metadata } from 'next'
import { satoshiFont } from '@repo/lib/assets/fonts/satoshi/satoshi'
import NextTopLoader from 'nextjs-toploader'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@repo/lib/assets/css/global.css'
import { Fathom } from '@repo/lib/shared/services/fathom/Fathom'
import { GlobalAlerts } from '@repo/lib/shared/components/navs/GlobalAlerts'
import { PropsWithChildren } from 'react'
import { Providers } from '@repo/lib/shared/components/site/providers'
import { NavBarContainer } from '@/lib/components/navs/NavBarContainer'
import { FooterContainer } from '@/lib/components/footer/FooterContainer'

export const metadata: Metadata = {
  title: 'Balancer DeFi Liquidity Pools',
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

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://w.appzi.io/w.js?token=8TY8k" />
      </head>
      <body
        className={satoshiFont.className}
        style={{ marginRight: '0px !important' }} // Required to prevent layout shift introduced by Rainbowkit
        suppressHydrationWarning
      >
        <Fathom />
        <NextTopLoader color="#7f6ae8" showSpinner={false} />
        <Providers>
          <GlobalAlerts />
          <NavBarContainer />
          {children}
          <FooterContainer />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}
