import { PropsWithChildren } from 'react'
import { RelicDepositProvider } from '@/lib/modules/reliquary/RelicDepositProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

type Props = PropsWithChildren

export default async function RelicDepositLayoutWrapper({ children }: Props) {
  return (
    <DefaultPageContainer>
      <RelicDepositProvider>
        <PriceImpactProvider>{children}</PriceImpactProvider>
      </RelicDepositProvider>
    </DefaultPageContainer>
  )
}
