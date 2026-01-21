'use client'

import { PropsWithChildren } from 'react'
import { RelicAddLiquidityProvider } from '@/lib/modules/reliquary/RelicAddLiquidityProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isHash, Hash } from 'viem'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function RelicAddLiquidityLayoutWrapper({ params: { txHash }, children }: Props) {
  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = (isHash(maybeTxHash) ? maybeTxHash : undefined) as Hash | undefined

  return (
    <DefaultPageContainer>
      <RelicAddLiquidityProvider urlTxHash={urlTxHash}>{children}</RelicAddLiquidityProvider>
    </DefaultPageContainer>
  )
}
