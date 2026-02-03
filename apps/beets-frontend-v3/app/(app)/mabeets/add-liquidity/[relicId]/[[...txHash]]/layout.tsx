'use client'

import { PropsWithChildren, use } from 'react'
import { RelicAddLiquidityProvider } from '@/lib/modules/reliquary/RelicAddLiquidityProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isHash, Hash } from 'viem'

type Props = PropsWithChildren<{
  params: Promise<{ relicId: string; txHash?: string[] }>
}>

export default function RelicAddLiquidityLayoutWrapper({ params, children }: Props) {
  const { relicId, txHash } = use(params)
  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = (isHash(maybeTxHash) ? maybeTxHash : undefined) as Hash | undefined

  return (
    <DefaultPageContainer>
      <RelicAddLiquidityProvider relicId={relicId} urlTxHash={urlTxHash}>
        {children}
      </RelicAddLiquidityProvider>
    </DefaultPageContainer>
  )
}
