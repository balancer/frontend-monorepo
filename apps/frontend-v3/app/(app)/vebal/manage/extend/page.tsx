'use client'

import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalExtend } from '@repo/lib/modules/vebal/lock/VebalExtend'
import { VebalLockActionsLayout } from '@repo/lib/modules/vebal/lock/VebalLockActionsLayout'
import { VebalLockProvider } from '@repo/lib/modules/vebal/lock/VebalLockProvider'

export default function VebalExtendPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <TokenInputsValidationProvider>
          <PriceImpactProvider>
            <VebalLockProvider>
              <VebalExtend />
            </VebalLockProvider>
          </PriceImpactProvider>
        </TokenInputsValidationProvider>
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
