import { PortfolioProvider } from '@/lib/modules/portfolio/PortfolioProvider'
import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'

export default async function PortfolioLayout({ children }: PropsWithChildren) {
  return (
    <DefaultPageContainer minH="100vh">
      <PortfolioProvider>{children}</PortfolioProvider>
    </DefaultPageContainer>
  )
}
