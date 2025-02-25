import { useGetTokenRates } from './useGetTokenRates'
import { useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { drawLiquidityECLP } from './eclp.helpers'
import { Pool } from '../pool/pool.types'

export function useGetECLPLiquidityProfile(pool: Pool) {
  const { data: tokenRates } = useGetTokenRates(pool)

  const tokenRateScalingFactorString = useMemo(() => {
    if (!tokenRates) return

    return bn(tokenRates[0]).div(bn(tokenRates[1])).toFixed(4)
  }, [tokenRates])

  const data = drawLiquidityECLP(pool, tokenRateScalingFactorString)

  return {
    data,
  }
}
