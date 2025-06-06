'use client'

import { PropsWithChildren, use } from 'react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isProd } from '@repo/lib/config/app.config'
import { redirect } from 'next/navigation'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { LbpFormProvider } from '@repo/lib/modules/lbp/LbpFormProvider'
import { LbpCreationProvider } from '@repo/lib/modules/lbp/LbpCreationProvider'
import { isHash } from 'viem'

type Props = PropsWithChildren<{
  params: Promise<{ txHash?: string[] }>
}>

export default function LBPCreateLayout({ params, children }: Props) {
  if (isProd) redirect('/')

  const resolvedParams = use(params)
  const maybeTxHash = resolvedParams.txHash?.[0] || ''
  const urlTxHash = isHash(maybeTxHash) ? maybeTxHash : undefined

  return (
    <DefaultPageContainer minH="100vh">
      <TransactionStateProvider>
        <LbpFormProvider>
          <Permit2SignatureProvider>
            <LbpCreationProvider urlTxHash={urlTxHash}>{children} </LbpCreationProvider>
          </Permit2SignatureProvider>
        </LbpFormProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
