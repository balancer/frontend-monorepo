import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useReliquary } from '../ReliquaryProvider'

export function useRelicDepositBalance() {
  const { selectedRelic } = useReliquary()
  const { bptPrice } = usePool()

  const relicBalanceUSD = selectedRelic ? parseFloat(selectedRelic.amount) * bptPrice : 0

  return {
    relicBalanceUSD,
  }
}
