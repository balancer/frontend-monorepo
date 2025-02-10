'use client'

import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { StakeForm } from '@repo/lib/modules/pool/actions/stake/StakeForm'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { StakeProvider } from '@repo/lib/modules/pool/actions/stake/StakeProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

export function StakePage() {
  return (
    <DefaultPageContainer>
      <TransactionStateProvider>
        <StakeProvider>
          <PoolActionsLayout>
            <StakeForm />
          </PoolActionsLayout>
        </StakeProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
