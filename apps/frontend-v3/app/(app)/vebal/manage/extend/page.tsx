'use client'

import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalExtend } from '@repo/lib/modules/vebal/lock/VebalExtend'
import { VebalLockActionsLayout } from '@repo/lib/modules/vebal/lock/VebalLockActionsLayout'

export default function VebalExtendPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <VebalExtend />
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
