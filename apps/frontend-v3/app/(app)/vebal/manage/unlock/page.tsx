'use client'

import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLockActionsLayout } from '@repo/lib/modules/vebal/lock/VebalLockActionsLayout'
import { VebalLockProvider } from '@repo/lib/modules/vebal/lock/VebalLockProvider'
import { VebalUnlock } from '@repo/lib/modules/vebal/lock/VebalUnlock'

export default function VebalLockPage() {
  return (
    <TransactionStateProvider>
      <VebalLockActionsLayout>
        <TokenInputsValidationProvider>
          <PriceImpactProvider>
            <VebalLockProvider>
              <VebalUnlock />
            </VebalLockProvider>
          </PriceImpactProvider>
        </TokenInputsValidationProvider>
      </VebalLockActionsLayout>
    </TransactionStateProvider>
  )
}
