import { useGetTokenRates } from './useGetTokenRates'
import { useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { drawLiquidityECLP } from './drawLiquidityECLP'
import { Pool } from '../pool/pool.types'
import { calculateSpotPrice, destructureRequiredPoolParams } from './calculateSpotPrice'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { formatUnits } from 'viem'

export function useGetECLPLiquidityProfile(pool: Pool) {
  const { data: tokenRates } = useGetTokenRates(pool)

  const tokenRateScalingFactorString = useMemo(() => {
    if (!tokenRates) return

    return bn(tokenRates[0]).div(bn(tokenRates[1])).toFixed(4)
  }, [tokenRates])

  const data = drawLiquidityECLP(pool, tokenRateScalingFactorString)

  const params = pool && pool.poolTokens ? destructureRequiredPoolParams(pool, tokenRates) : null

  const poolSpotPrice = params
    ? formatUnits(calculateSpotPrice(pool.type as GqlPoolType.Gyroe, params), 18)
    : null

  const xMin = useMemo(() => (data ? Math.min(...data.map(([x]) => x)) : 0), [data])
  const xMax = useMemo(() => (data ? Math.max(...data.map(([x]) => x)) : 0), [data])
  //const yMin = useMemo(() => (data ? Math.min(...data.map(([, y]) => y)) : 0), [data])
  const yMax = useMemo(() => (data ? Math.max(...data.map(([, y]) => y)) : 0), [data])

  const poolIsInRange = useMemo(() => {
    const margin = 0.00000001 // if spot price is within the margin on both sides it's considered out of range

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
  }
}
