import { satoshiFont } from '@repo/lib/assets/fonts/satoshi/satoshi'
import NextTopLoader from 'nextjs-toploader'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@repo/lib/assets/css/global.css'
import { PropsWithChildren } from 'react'
import { Providers } from '@repo/lib/shared/components/site/providers'
import { DEFAULT_THEME_COLOR_MODE } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import { ThemeProvider as ColorThemeProvider } from 'next-themes'
import { ThemeProvider } from '@/lib/services/chakra/ThemeProvider'
import { NavBarContainer } from '@/lib/components/navs/NavBarContainer'
import { GlobalAlerts } from '@repo/lib/shared/components/navs/GlobalAlerts'
import { FooterContainer } from '@/lib/components/footer/FooterContainer'

export function BaseLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={satoshiFont.className}
        style={{ marginRight: '0px !important' }}
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
                <GlobalAlerts />
                <NavBarContainer />
                {children}
                <FooterContainer />
                <SpeedInsights />
              </Providers>
            </ThemeProvider>
          </ColorThemeProvider>
        </div>
      </body>
    </html>
  )
}
