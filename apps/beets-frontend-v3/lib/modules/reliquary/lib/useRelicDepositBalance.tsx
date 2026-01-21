import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useReliquary } from '../ReliquaryProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

export function useRelicDepositBalance(relicId: string) {
  const { relicPositions } = useReliquary()
  const { bptPrice } = usePool()

  const relic = relicPositions.find(r => r.relicId === relicId)
  const relicBalanceUSD = relic ? bn(relic.amount).times(bptPrice).toNumber() : 0

  return {
    relicBalanceUSD,
  }
}
