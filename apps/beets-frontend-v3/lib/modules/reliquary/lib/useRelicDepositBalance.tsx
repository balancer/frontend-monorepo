import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useReliquary } from '../ReliquaryProvider'

export function useRelicDepositBalance(relicId: string) {
  const { relicPositions } = useReliquary()
  const { bptPrice } = usePool()

  const relic = relicPositions.find(r => r.relicId === relicId)
  const relicBalanceUSD = relic ? parseFloat(relic.amount) * bptPrice : 0

  return {
    relicBalanceUSD,
  }
}
