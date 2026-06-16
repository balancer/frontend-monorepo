import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { PoolContainer } from '@repo/lib/modules/pool/PoolContainer'

export default function PoolPage() {
  return (
    <TransactionStateProvider>
      <PoolContainer />
    </TransactionStateProvider>
  )
}
