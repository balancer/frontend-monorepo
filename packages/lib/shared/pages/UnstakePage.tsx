'use client'

import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { UnstakeForm } from '@repo/lib/modules/pool/actions/unstake/UnstakeForm'
import { UnstakeProvider } from '@repo/lib/modules/pool/actions/unstake/UnstakeProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'

export function UnstakePage() {
  return (
    <DefaultPageContainer>
      <TransactionStateProvider>
        <RelayerSignatureProvider>
          <UnstakeProvider>
            <PoolActionsLayout>
              <UnstakeForm />
            </PoolActionsLayout>
          </UnstakeProvider>
        </RelayerSignatureProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
