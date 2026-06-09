import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useReliquary } from '../ReliquaryProvider'
import { bn, isValidNumber } from '@repo/lib/shared/utils/numbers'

export function useRelicAddLiquidityBalance(relicId: string) {
  const { relicPositions } = useReliquary()
  const { bptPrice } = usePool()

  const relic = relicPositions.find(r => r.relicId === relicId)
  const relicBalanceUSD =
    relic && isValidNumber(relic.amount) ? bn(relic.amount).times(bptPrice).toNumber() : 0

  return {
    relicBalanceUSD,
  }
}
