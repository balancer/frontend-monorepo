'use client'

import { PoolCreationForm } from '@repo/lib/modules/pool/actions/create/PoolCreationForm'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { PoolFormProvider } from '@repo/lib/modules/pool/actions/create/PoolCreationFormProvider'

export default function PoolCreationPage() {
  return (
    <DefaultPageContainer minH="100vh">
      <TransactionStateProvider>
        <PoolFormProvider>
          <Permit2SignatureProvider>
            <PoolCreationForm />
          </Permit2SignatureProvider>
        </PoolFormProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
