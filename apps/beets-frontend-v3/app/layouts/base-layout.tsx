import NextTopLoader from 'nextjs-toploader'
import { PropsWithChildren } from 'react'
import { NavBarContainer } from '@/lib/components/navs/NavBarContainer'
import { GlobalAlerts } from '@repo/lib/shared/components/navs/GlobalAlerts'
import { FooterContainer } from '@/lib/components/footer/FooterContainer'
import { LzBeetsMigrateModal } from '@/lib/components/modals/LzBeetsMigrateModal'

export function BaseLayout({
  children,
  renderLzBeetsModal = true,
}: PropsWithChildren & { renderLzBeetsModal?: boolean }) {
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
      {renderLzBeetsModal && <LzBeetsMigrateModal />}
      <FooterContainer />
    </div>
  )
}
