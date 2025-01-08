import NextTopLoader from 'nextjs-toploader'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PropsWithChildren } from 'react'
import { NavBarContainer } from '@/lib/components/navs/NavBarContainer'
import { GlobalAlerts } from '@repo/lib/shared/components/navs/GlobalAlerts'
import { FooterContainer } from '@/lib/components/footer/FooterContainer'
import { LzBeetsMigrateModal } from '@/lib/components/modals/LzBeetsMigrateModal'

export function BaseLayout({
  children,
  isNotFound = false,
}: PropsWithChildren & { isNotFound?: boolean }) {
  return (
    <div
      style={{
        backgroundImage: 'url(/images/misc/pattern-sml-7@2x.webp)',
        backgroundSize: '8%',
      }}
    >
      <NextTopLoader color="#7f6ae8" showSpinner={false} />
      <GlobalAlerts />
      <NavBarContainer />
      {children}
      {!isNotFound && <LzBeetsMigrateModal />}
      <FooterContainer />
      <SpeedInsights />
    </div>
  )
}
