import { useTokens } from '../tokens/TokensProvider'
import { getCompositionTokens } from './pool-tokens.utils'
import { isDynamicLBP } from './pool.helpers'
import { usePool } from './PoolProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

// originally implemented here: https://github.com/balancer/frontend-monorepo/pull/617
// for issue: https://github.com/balancer/frontend-monorepo/issues/535
export function useGetPoolTokensWithActualWeights() {
  const { pool, chain } = usePool()
  const { calcWeightForBalance, calcTotalUsdValue, priceFor } = useTokens()

  const compositionTokens = getCompositionTokens(pool)
  let totalLiquidity = calcTotalUsdValue(compositionTokens, chain)

  if (isDynamicLBP(pool) && pool.isSeedless) {
    const virtualToken = pool.poolTokens[pool.reserveTokenIndex].address
    const price = priceFor(virtualToken, chain)
    totalLiquidity = bn(totalLiquidity)
      .plus(bn(pool.reserveTokenVirtualBalance).times(price))
      .toString()
  }

  const poolTokensWithActualWeights = Object.fromEntries(
    compositionTokens.map(compositionToken => [
      compositionToken.address,
      calcWeightForBalance(
        compositionToken.address,
        compositionToken.balance,
        totalLiquidity,
        chain
      ),
    ])
  ) as Record<string, string>

  return { poolTokensWithActualWeights, compositionTokens }
}
