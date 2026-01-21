'use client'

import { PropsWithChildren } from 'react'
import { RelicDepositProvider } from '@/lib/modules/reliquary/RelicDepositProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isHash, Hash } from 'viem'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function RelicDepositLayoutWrapper({ params: { txHash }, children }: Props) {
  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = (isHash(maybeTxHash) ? maybeTxHash : undefined) as Hash | undefined

  return (
    <DefaultPageContainer>
      <RelicDepositProvider urlTxHash={urlTxHash}>{children}</RelicDepositProvider>
    </DefaultPageContainer>
  )
}
