'use client'

import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLockActionsLayout } from '@repo/lib/modules/vebal/lock/VebalLockActionsLayout'
import { VebalUnlock } from '@repo/lib/modules/vebal/lock/VebalUnlock'

export default function VebalLockPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <VebalUnlock />
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
