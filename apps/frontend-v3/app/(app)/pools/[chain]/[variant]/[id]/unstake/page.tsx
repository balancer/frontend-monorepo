'use client'

import { PoolActionsLayout } from '@/lib/modules/pool/actions/PoolActionsLayout'
import { UnstakeForm } from '@/lib/modules/pool/actions/unstake/UnstakeForm'
import { UnstakeProvider } from '@/lib/modules/pool/actions/unstake/UnstakeProvider'
import { TransactionStateProvider } from '@/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'

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
