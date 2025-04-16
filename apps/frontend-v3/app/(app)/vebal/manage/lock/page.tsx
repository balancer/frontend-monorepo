'use client'

import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLock } from '@/lib/vebal/lock/VebalLock'
import { VebalLockActionsLayout } from '@/lib/vebal/lock/VebalLockActionsLayout'

export default function VebalLockPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <VebalLock />
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
