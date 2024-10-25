import { PoolDetail } from '@repo/lib/modules/pool/PoolDetail/PoolDetail'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLockDataProvider } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'

export default function PoolPage() {
  return (
    <TransactionStateProvider>
      <VebalLockDataProvider>
        <PoolDetail />
      </VebalLockDataProvider>
    </TransactionStateProvider>
  )
}
