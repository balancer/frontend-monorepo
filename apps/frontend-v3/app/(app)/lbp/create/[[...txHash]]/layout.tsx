'use client'

import { PropsWithChildren } from 'react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isProd } from '@repo/lib/config/app.config'
import { redirect } from 'next/navigation'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { LbpFormProvider } from '@repo/lib/modules/lbp/LbpFormProvider'

export default function LBPCreateLayout({ children }: PropsWithChildren) {
  if (isProd) redirect('/')

  return (
    <DefaultPageContainer minH="100vh">
      <TransactionStateProvider>
        <LbpFormProvider>
          <Permit2SignatureProvider>{children}</Permit2SignatureProvider>
        </LbpFormProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
