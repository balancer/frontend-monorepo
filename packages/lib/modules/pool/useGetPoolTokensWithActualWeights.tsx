import { useTokens } from '../tokens/TokensProvider'
import { getCompositionTokens } from './pool-tokens.utils'
import { usePool } from './PoolProvider'

// originally implemented here: https://github.com/balancer/frontend-monorepo/pull/617
// for issue: https://github.com/balancer/frontend-monorepo/issues/535
export function useGetPoolTokensWithActualWeights() {
  const { pool, chain } = usePool()
  const { calcWeightForBalance, calcTotalUsdValue } = useTokens()

  const compositionTokens = getCompositionTokens(pool)
  const totalLiquidity = calcTotalUsdValue(compositionTokens, chain)

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
