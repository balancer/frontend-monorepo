/* eslint-disable max-len */
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { satoshiFont } from '@repo/lib/assets/fonts/satoshi/satoshi'
import '@repo/lib/assets/css/global.css'
import { DEFAULT_THEME_COLOR_MODE } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import { ThemeProvider as ColorThemeProvider } from 'next-themes'
import { ThemeProvider } from '@/lib/services/chakra/ThemeProvider'
import { Providers } from '@repo/lib/shared/components/site/providers'
import { ThemeSettingsProvider } from '@repo/lib/shared/services/chakra/useThemeSettings'

export const metadata: Metadata = {
  title: 'Beets',
  description: `The Flagship LST Hub on Sonic. From seamless staking to earning real yield on LST-focused liquidity pools, beets is the ultimate destination for your liquid-staked tokens.`,
  icons: [{ rel: 'icon', type: 'image/x-icon', url: '/favicon.ico' }],
  metadataBase: new URL('https://beets.fi'),
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={satoshiFont.className}
        style={{ marginRight: '0px !important' }} // Required to prevent layout shift introduced by Rainbowkit
        suppressHydrationWarning
      >
        <ColorThemeProvider defaultTheme={DEFAULT_THEME_COLOR_MODE}>
          <ThemeProvider>
            <ThemeSettingsProvider settings={{ hideDarkModeToggle: true }}>
              <Providers>{children}</Providers>
            </ThemeSettingsProvider>
          </ThemeProvider>
        </ColorThemeProvider>
      </body>
    </html>
  )
}
