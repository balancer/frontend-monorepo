import { PoolDetail } from '@repo/lib/modules/pool/PoolDetail/PoolDetail'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { VebalLockInfoProvider } from '@repo/lib/modules/vebal/lock/VebalLockInfoProvider'

export default function PoolPage() {
  return (
    <TransactionStateProvider>
      <VebalLockInfoProvider>
        <PoolDetail />
      </VebalLockInfoProvider>
    </TransactionStateProvider>
  )
}
