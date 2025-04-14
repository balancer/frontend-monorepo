'use client'

import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLock } from '@repo/lib/modules/vebal/lock/VebalLock'
import { VebalLockActionsLayout } from '@repo/lib/modules/vebal/lock/VebalLockActionsLayout'

export default function VebalLockPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <VebalLock />
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
