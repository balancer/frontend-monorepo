'use client'

import { PropsWithChildren, use } from 'react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isHash, Hash } from 'viem'
import { RelicWithdrawProvider } from '@/lib/modules/reliquary/RelicWithdrawProvider'
import { PermitSignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/PermitSignatureProvider'

type Props = PropsWithChildren<{
  params: Promise<{ relicId: string; txHash?: string[] }>
}>

export default function RelicWithdrawLayoutWrapper({ params, children }: Props) {
  const { relicId, txHash } = use(params)
  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = (isHash(maybeTxHash) ? maybeTxHash : undefined) as Hash | undefined

  return (
    <DefaultPageContainer>
      <PermitSignatureProvider>
        <RelicWithdrawProvider relicId={relicId} urlTxHash={urlTxHash}>
          {children}
        </RelicWithdrawProvider>
      </PermitSignatureProvider>
    </DefaultPageContainer>
  )
}
