import { useGetTokenRates } from './useGetTokenRates'
import { useMemo, useState } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { drawLiquidityECLP } from '../helpers/drawLiquidityECLP'
import { Pool } from '../../pool/pool.types'
import { calculateSpotPrice, destructureRequiredPoolParams } from '../helpers/calculateSpotPrice'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { Address, formatUnits } from 'viem'
import { getPoolActionableTokens, getPriceRateRatio } from '../../pool/pool-tokens.utils'
import { useTokens } from '../../tokens/TokensProvider'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'

export function useGetECLPLiquidityProfile(pool: Pool) {
  const { data: tokenRates, isLoading } = useGetTokenRates(pool)
  const [isReversed, setIsReversed] = useState(false)
  const { canScaleBack } = useTokens()

  function toggleIsReversed() {
    setIsReversed(!isReversed)
  }

  const tokenRateScalingFactorString = useMemo(() => {
    if (!tokenRates) return

    return bn(tokenRates[0]).div(bn(tokenRates[1])).toFixed(4)
  }, [tokenRates])

  const liquidityData = useMemo(
    () => drawLiquidityECLP(pool, tokenRateScalingFactorString),
    [pool, tokenRateScalingFactorString]
  )

  const tokensToScaleBack = pool.poolTokens.filter(
    token => canScaleBack(token.address, pool.chain) && token.useUnderlyingForAddRemove
  )

  const tokens = tokensToScaleBack.length
    ? getPoolActionableTokens(pool)
    : (pool.poolTokens as ApiToken[])

  const priceRateRatio = getPriceRateRatio(
    tokens,
    tokensToScaleBack.map(token => token.address as Address)
  )

  const params = pool && pool.poolTokens ? destructureRequiredPoolParams(pool, tokenRates) : null

  const originalPoolSpotPrice = params
    ? bn(formatUnits(calculateSpotPrice(pool.type as GqlPoolType.Gyroe, params), 18))
        .div(priceRateRatio)
        .toNumber()
    : null

  const poolSpotPrice = useMemo(() => {
    if (!originalPoolSpotPrice) return null
    return isReversed ? bn(1).div(bn(originalPoolSpotPrice)).toString() : originalPoolSpotPrice
  }, [originalPoolSpotPrice, isReversed])

  const data = useMemo(() => {
    if (!liquidityData) return null

    const transformedData = liquidityData
      .filter(([price]) => price !== 0) // filter out zero price to prevent infinity on reverse
      .map(([price, liquidity]) => {
        const displayedPrice = bn(price).div(priceRateRatio).toNumber()
        return isReversed ? [1 / displayedPrice, liquidity] : [displayedPrice, liquidity]
      })

    return transformedData.sort((a, b) => a[0] - b[0]) as [[number, number]]
  }, [liquidityData, isReversed, priceRateRatio])

  const xMin = useMemo(() => (data ? Math.min(...data.map(([x]) => x)) : 0), [data])
  const xMax = useMemo(() => (data ? Math.max(...data.map(([x]) => x)) : 0), [data])
  //const yMin = useMemo(() => (data ? Math.min(...data.map(([, y]) => y)) : 0), [data])
  const yMax = useMemo(() => (data ? Math.max(...data.map(([, y]) => y)) : 0), [data])

  const poolIsInRange = useMemo(() => {
    const margin = 0.00001 // if spot price is within the margin on both sides it's considered out of range

    return (
      bn(poolSpotPrice || 0).gt(xMin * (1 + margin)) &&
      bn(poolSpotPrice || 0).lt(xMax * (1 - margin))
    )
  }, [xMin, xMax, poolSpotPrice])

  return {
    data,
    poolSpotPrice,
    poolIsInRange,
    xMin,
    xMax,
    yMax,
    isReversed,
    toggleIsReversed,
    isLoading,
    poolTokens: tokens,
  }
}
