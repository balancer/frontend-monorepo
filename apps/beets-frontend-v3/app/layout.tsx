import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { satoshiFont } from '@repo/lib/assets/fonts/satoshi/satoshi'
import '@repo/lib/assets/css/global.css'
import { ThemeProvider } from '@/lib/services/chakra/ThemeProvider'
import { Providers } from '@repo/lib/shared/components/site/providers'

export const metadata: Metadata = {
  title: 'Beets',
  description: `The flagship LST hub on Sonic. From seamless staking to earning real yield on LST-focused liquidity pools, Beets is the ultimate destination for your liquid staking tokens.`,
  icons: [{ rel: 'icon', type: 'image/x-icon', url: '/favicon.ico' }],
  metadataBase: new URL('https://beets.fi'),
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body
        className={satoshiFont.className}
        style={{ marginRight: '0px !important' }} // Required to prevent layout shift introduced by Rainbowkit
      >
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
