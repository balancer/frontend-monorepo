'use client'

import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalExtend } from '@/lib/vebal/lock/VebalExtend'
import { VebalLockActionsLayout } from '@/lib/vebal/lock/VebalLockActionsLayout'

export default function VebalExtendPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <VebalExtend />
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
