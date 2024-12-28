/* eslint-disable max-len */
import { Metadata } from 'next'
import { satoshiFont } from '@repo/lib/assets/fonts/satoshi/satoshi'
import NextTopLoader from 'nextjs-toploader'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@repo/lib/assets/css/global.css'
import { GlobalAlerts } from '@repo/lib/shared/components/navs/GlobalAlerts'
import { PropsWithChildren } from 'react'
import { Providers } from '@repo/lib/shared/components/site/providers'
import { NavBarContainer } from '@/lib/components/navs/NavBarContainer'
import { FooterContainer } from '@/lib/components/footer/FooterContainer'
import { DEFAULT_THEME_COLOR_MODE } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import { ThemeProvider as ColorThemeProvider } from 'next-themes'
import { ThemeProvider } from '@/lib/services/chakra/ThemeProvider'
import { VebalLockDataProvider } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { PoolsNetworkWatcher } from '@/lib/components/navs/PoolsNetworkWatcher'
import { LzBeetsMigrateModal } from '@/lib/components/migrate/LzBeetsMigrateModal'

export const metadata: Metadata = {
  title: 'Beets',
  description: `The Flagship LST Hub on Sonic. From seamless staking to earning real yield on LST-focused liquidity pools, beets is the ultimate destination for your liquid-staked tokens.`,
  icons: [{ rel: 'icon', type: 'image/x-icon', url: '/favicon.ico' }],
  metadataBase: new URL('https://zen.beets.fi'),
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={satoshiFont.className}
        style={{ marginRight: '0px !important' }} // Required to prevent layout shift introduced by Rainbowkit
        suppressHydrationWarning
      >
        <div
          style={{
            backgroundImage: 'url(/images/misc/pattern-sml-7@2x.webp)',
            backgroundSize: '8%',
          }}
        >
          <NextTopLoader color="#7f6ae8" showSpinner={false} />
          <ColorThemeProvider defaultTheme={DEFAULT_THEME_COLOR_MODE}>
            <ThemeProvider>
              <Providers>
                <VebalLockDataProvider>
                  <GlobalAlerts />
                  <NavBarContainer />
                  {children}
                  <LzBeetsMigrateModal />
                  <FooterContainer />
                  <SpeedInsights />
                  <PoolsNetworkWatcher />
                </VebalLockDataProvider>
              </Providers>
            </ThemeProvider>
          </ColorThemeProvider>
        </div>
      </body>
    </html>
  )
}
