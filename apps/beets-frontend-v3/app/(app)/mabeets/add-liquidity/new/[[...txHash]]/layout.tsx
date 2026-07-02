'use client'

import { PropsWithChildren } from 'react'
import { RelicAddLiquidityProvider } from '@/lib/modules/reliquary/RelicAddLiquidityProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { isHash, Hash } from 'viem'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function RelicAddLiquidityLayoutWrapper({ params: { txHash }, children }: Props) {
  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = (isHash(maybeTxHash) ? maybeTxHash : undefined) as Hash | undefined

  return (
    <DefaultPageContainer>
      <PriceImpactProvider>
        <RelicAddLiquidityProvider urlTxHash={urlTxHash}>{children}</RelicAddLiquidityProvider>
      </PriceImpactProvider>
    </DefaultPageContainer>
  )
}
