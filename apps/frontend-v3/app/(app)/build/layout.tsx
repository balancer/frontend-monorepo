'use client'

import { PropsWithChildren } from 'react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isProd } from '@repo/lib/config/app.config'
import { redirect } from 'next/navigation'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { PoolFormProvider } from '@repo/lib/modules/pool/actions/create/PoolFormProvider'

export default function BuildLayout({ children }: PropsWithChildren) {
  if (isProd) redirect('/')

  return (
    <DefaultPageContainer minH="100vh">
      <TransactionStateProvider>
        <PoolFormProvider>
          <Permit2SignatureProvider>{children}</Permit2SignatureProvider>
        </PoolFormProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
