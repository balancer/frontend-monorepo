import { useGetTokenRates } from './useGetTokenRates'
import { useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { drawLiquidityECLP } from './drawLiquidityECLP'
import { Pool } from '../pool/pool.types'
import { calculateSpotPrice, destructureRequiredPoolParams } from './calculateSpotPrice'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { fNum } from '@repo/lib/shared/utils/numbers'

export function useGetECLPLiquidityProfile(pool: Pool) {
  const { data: tokenRates } = useGetTokenRates(pool)

  const tokenRateScalingFactorString = useMemo(() => {
    if (!tokenRates) return

    return bn(tokenRates[0]).div(bn(tokenRates[1])).toFixed(4)
  }, [tokenRates])

  const data = drawLiquidityECLP(pool, tokenRateScalingFactorString)

  const params = pool && pool.poolTokens ? destructureRequiredPoolParams(pool, tokenRates) : null

  const poolSpotPrice = params
    ? fNum('boost', calculateSpotPrice(pool.type as GqlPoolType.Gyroe, params))
    : null

  return {
    data,
    poolSpotPrice,
  }
}
