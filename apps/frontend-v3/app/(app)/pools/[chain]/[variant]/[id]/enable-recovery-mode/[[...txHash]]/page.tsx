'use client'

import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { RecoveryMode } from '@repo/lib/modules/pool/actions/recovery-mode/RecoveryMode'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

export default function EnableRecoveryModePage() {
  return (
    <DefaultPageContainer>
      <PoolActionsLayout>
        <TransactionStateProvider>
          <RecoveryMode />
        </TransactionStateProvider>
      </PoolActionsLayout>
    </DefaultPageContainer>
  )
}
