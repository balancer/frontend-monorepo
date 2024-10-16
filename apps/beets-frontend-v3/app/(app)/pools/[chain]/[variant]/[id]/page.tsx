import { PoolDetail } from '@repo/lib/modules/pool/PoolDetail/PoolDetail'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export default function PoolPage() {
  return (
    <TransactionStateProvider>
      <PoolDetail />
    </TransactionStateProvider>
  )
}
