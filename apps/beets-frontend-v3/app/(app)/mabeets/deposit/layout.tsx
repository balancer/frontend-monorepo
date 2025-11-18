'use client'

import { PropsWithChildren } from 'react'
import { RelicDepositProvider } from '@/lib/modules/reliquary/RelicDepositProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isHash } from 'viem'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function RelicDepositLayoutWrapper({ params: { txHash }, children }: Props) {
  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = isHash(maybeTxHash) ? maybeTxHash : undefined

  return (
    <DefaultPageContainer>
      <RelicDepositProvider urlTxHash={urlTxHash}>
        <PriceImpactProvider>{children}</PriceImpactProvider>
      </RelicDepositProvider>
    </DefaultPageContainer>
  )
}
