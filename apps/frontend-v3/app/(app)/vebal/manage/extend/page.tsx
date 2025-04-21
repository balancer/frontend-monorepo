'use client'

import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalExtend } from '@bal/lib/vebal/lock/VebalExtend'
import { VebalLockActionsLayout } from '@bal/lib/vebal/lock/VebalLockActionsLayout'

export default function VebalExtendPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <VebalExtend />
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
