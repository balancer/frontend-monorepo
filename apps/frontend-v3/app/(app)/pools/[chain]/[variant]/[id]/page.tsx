import { PoolContainer } from '@repo/lib/modules/pool/PoolContainer'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export default function PoolPage() {
  return (
    <TransactionStateProvider>
      <PoolContainer />
    </TransactionStateProvider>
  )
}
