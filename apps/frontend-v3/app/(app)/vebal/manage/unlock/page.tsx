'use client'

import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLockActionsLayout } from '@bal/lib/vebal/lock/VebalLockActionsLayout'
import { VebalUnlock } from '@bal/lib/vebal/lock/VebalUnlock'

export default function VebalLockPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <VebalUnlock />
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
