import { PortfolioProvider } from '@/lib/modules/portfolio/PortfolioProvider'
import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'

type Props = {
  children: React.ReactNode
}

export default async function PortfolioLayout({ children }: Props) {
  return (
    <DefaultPageContainer minH="100vh">
      <PortfolioProvider>{children}</PortfolioProvider>
    </DefaultPageContainer>
  )
}
