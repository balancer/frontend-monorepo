import { PropsWithChildren } from 'react'
import { RelicDepositProvider } from '@/lib/modules/reliquary/RelicDepositProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

type Props = PropsWithChildren<{
  params: { relicId?: string }
}>

export default async function RelicDepositLayoutWrapper({ params, children }: Props) {
  const relicId = await params
  return (
    <DefaultPageContainer>
      <RelicDepositProvider relicId={relicId.relicId}>
        <PriceImpactProvider>{children}</PriceImpactProvider>
      </RelicDepositProvider>
    </DefaultPageContainer>
  )
}
