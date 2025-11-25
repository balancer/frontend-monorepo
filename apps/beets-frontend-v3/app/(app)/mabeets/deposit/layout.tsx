'use client'

import { PropsWithChildren } from 'react'
import { RelicDepositProvider } from '@/lib/modules/reliquary/RelicDepositProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

type Props = PropsWithChildren<{
  params: { relicId?: string }
}>

export default function RelicDepositLayoutWrapper({ params: { relicId }, children }: Props) {
  return (
    <DefaultPageContainer>
      <RelicDepositProvider relicId={relicId}>
        <PriceImpactProvider>{children}</PriceImpactProvider>
      </RelicDepositProvider>
    </DefaultPageContainer>
  )
}
