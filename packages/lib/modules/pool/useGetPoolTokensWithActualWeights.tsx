import { useTokens } from '../tokens/TokensProvider'
import { getCompositionTokens } from './pool-tokens.utils'
import { isDynamicLBP } from './pool.helpers'
import { Pool } from './pool.types'
import { bn } from '@repo/lib/shared/utils/numbers'

// originally implemented here: https://github.com/balancer/frontend-monorepo/pull/617
// for issue: https://github.com/balancer/frontend-monorepo/issues/535
export function useGetPoolTokensWithActualWeights(pool: Pool) {
  const { calcWeightForBalance, calcTotalUsdValue, priceFor } = useTokens()

  const compositionTokens = getCompositionTokens(pool)
  let totalLiquidity = calcTotalUsdValue(compositionTokens, pool.chain)
  const isSeedlessLBP = isDynamicLBP(pool) && pool.isSeedless

  if (isSeedlessLBP) {
    const virtualToken = pool.poolTokens[pool.reserveTokenIndex].address
    const price = priceFor(virtualToken, pool.chain)
    totalLiquidity = bn(totalLiquidity)
      .plus(bn(pool.reserveTokenVirtualBalance).times(price))
      .toString()
  }

  const poolTokensWithActualWeights = Object.fromEntries(
    compositionTokens.map(compositionToken => {
      const isVirtualPairedToken =
        isSeedlessLBP &&
        pool.poolTokens[pool.reserveTokenIndex].address === compositionToken.address

      const tokenBalance = isVirtualPairedToken
        ? bn(compositionToken.balance).plus(pool.reserveTokenVirtualBalance).toString()
        : compositionToken.balance

      return [
        compositionToken.address,
        calcWeightForBalance(compositionToken.address, tokenBalance, totalLiquidity, pool.chain),
      ]
    })
  ) as Record<string, string>

  return { poolTokensWithActualWeights, compositionTokens }
}
