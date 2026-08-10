import { Metadata } from 'next'
import { satoshiFont } from '@repo/lib/assets/fonts/satoshi/satoshi'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@repo/lib/assets/css/global.css'
import Script from 'next/script'
import { PropsWithChildren } from 'react'
import { Providers } from '@repo/lib/shared/components/site/providers'
import { ThemeProvider } from '@bal/lib/services/chakra/ThemeProvider'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : 'https://balancer.fi'
  ),
  title: `Balancer—DeFi Liquidity Pools`,
  description: `Explore liquidity pools on Balancer and earn passively in yield-bearing pools.`,
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
  openGraph: {
    title: `Balancer—DeFi Liquidity Pools`,
    description: `Explore liquidity pools on Balancer and earn passively in yield-bearing pools.`,
    siteName: 'Balancer',
    type: 'website',
  },
  other: {
    'base:app_id': '6a030a6b0ec9a0da335752af',
  },
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body
        className={satoshiFont.className}
        style={{ marginRight: '0px !important' }} // Required to prevent layout shift introduced by Rainbowkit
      >
        <ThemeProvider>
          <Providers>
            {children}
            <SpeedInsights />
            <Script async src="https://w.appzi.io/w.js?token=8TY8k" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
