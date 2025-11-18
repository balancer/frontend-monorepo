'use client'

import { PropsWithChildren } from 'react'
import { RelicWithdrawProvider } from '@/lib/modules/reliquary/RelicWithdrawProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isHash } from 'viem'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function RelicWithdrawLayoutWrapper({ params: { txHash }, children }: Props) {
  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = isHash(maybeTxHash) ? maybeTxHash : undefined

  return (
    <DefaultPageContainer>
      <RelicWithdrawProvider urlTxHash={urlTxHash}>
        <PriceImpactProvider>{children}</PriceImpactProvider>
      </RelicWithdrawProvider>
    </DefaultPageContainer>
  )
}
