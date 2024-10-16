'use client'

import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { UnstakeForm } from '@repo/lib/modules/pool/actions/unstake/UnstakeForm'
import { UnstakeProvider } from '@repo/lib/modules/pool/actions/unstake/UnstakeProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

export default function UnstakePage() {
  return (
    <DefaultPageContainer>
      <TransactionStateProvider>
        <UnstakeProvider>
          <PoolActionsLayout>
            <UnstakeForm />
          </PoolActionsLayout>
        </UnstakeProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
