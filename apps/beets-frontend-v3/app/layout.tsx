/* eslint-disable max-len */
import { Metadata } from 'next'
import { Footer } from '@repo/lib/shared/components/navs/Footer'
import { satoshiFont } from '@repo/lib/assets/fonts/satoshi/satoshi'
import NextTopLoader from 'nextjs-toploader'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@repo/lib/assets/css/global.css'
import { GlobalAlerts } from '@repo/lib/shared/components/navs/GlobalAlerts'
import { PropsWithChildren } from 'react'
import { Providers } from '@repo/lib/shared/components/site/providers'
import { NavBarContainer } from '@repo/beets/components/navs/NavBarContainer'

export const metadata: Metadata = {
  title: 'Beets DeFi Liquidity Pools',
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
      <body
        className={satoshiFont.className}
        suppressHydrationWarning
        style={{ marginRight: '0px !important' }} // Required to prevent layout shift introduced by Rainbowkit
      >
        <NextTopLoader showSpinner={false} color="#7f6ae8" />
        <Providers>
          <GlobalAlerts />
          <NavBarContainer />
          {children}
          <Footer />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}
