/* eslint-disable react-hooks/preserve-manual-memoization */
import { useGetTokenRates } from './useGetTokenRates'
import { useMemo, useState } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { drawLiquidityECLP } from '../helpers/drawLiquidityECLP'
import { calculateSpotPrice, destructureRequiredPoolParams } from '../helpers/calculateSpotPrice'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { formatUnits } from 'viem'
import { getPriceRateRatio } from '../../pool/pool-tokens.utils'
import { getPoolActionableTokens } from '../../pool/pool-tokens.utils'
import { usePool } from '../../pool/PoolProvider'
import { GqlPoolGyro } from '@repo/lib/shared/services/api/generated/graphql'
import { isGyroEPool } from '../../pool/pool.helpers'

export type ECLPLiquidityProfile = {
  data: [number, number][] | null
  poolSpotPrice: string | number | null
  poolIsInRange: boolean
  xMin: number
  xMax: number
  yMax: number
  isReversed: boolean
  toggleIsReversed: () => void
  isLoading: boolean
  poolTokens: string[]
}

export function useGetECLPLiquidityProfile(): ECLPLiquidityProfile {
  const { pool } = usePool()
  const { data: tokenRates, isLoading } = useGetTokenRates(pool)
  const [isReversed, setIsReversed] = useState(false)

  const gyroPool = pool as GqlPoolGyro

  const eclpParams = {
    alpha: Number(gyroPool.alpha),
    beta: Number(gyroPool.beta),
    s: Number(gyroPool.s),
    c: Number(gyroPool.c),
    lambda: Number(gyroPool.lambda),
  }

  function toggleIsReversed() {
    setIsReversed(!isReversed)
  }

  const tokenRateScalingFactorString = useMemo(() => {
    if (!tokenRates) return

    return bn(tokenRates[0]).div(bn(tokenRates[1])).toString()
  }, [tokenRates])

  const liquidityData = useMemo(
    () => drawLiquidityECLP(isGyroEPool(pool), eclpParams, tokenRateScalingFactorString),
    [pool, tokenRateScalingFactorString]
  )

  const priceRateRatio = getPriceRateRatio(pool)

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

    return transformedData.sort((a, b) => a[0] - b[0]) as [number, number][]
  }, [liquidityData, isReversed, priceRateRatio])

  const xMin = useMemo(() => (data ? Math.min(...data.map(([x]) => x)) : 0), [data])
  const xMax = useMemo(() => (data ? Math.max(...data.map(([x]) => x)) : 0), [data])
  //const yMin = useMemo(() => (data ? Math.min(...data.map(([, y]) => y)) : 0), [data])
  const yMax = useMemo(() => (data ? Math.max(...data.map(([, y]) => y)) : 0), [data])

  const poolIsInRange = useMemo(() => {
    const margin = 0.00005 // if spot price is within the margin on both sides it's considered out of range

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
    poolTokens: getPoolActionableTokens(pool).map(token => token.symbol),
  }
}
