import { type ECLPLiquidityProfile } from '@repo/lib/modules/eclp/hooks/useGetECLPLiquidityProfile'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { drawLiquidityECLP } from '@repo/lib/modules/eclp/helpers/drawLiquidityECLP'
import { useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { usePoolSpotPriceWithoutRate } from '../steps/details/usePoolSpotPriceWithoutRate'

export function usePreviewEclpLiquidityProfile(): ECLPLiquidityProfile {
  const { eclpConfigForm, isGyroEclp, poolTokens } = usePoolCreationForm()
  const { spotPriceWithoutRate, rateTokenA, rateTokenB } = usePoolSpotPriceWithoutRate()

  const poolSpotPrice = spotPriceWithoutRate.toString()

  const isReversed = false // perma false seems to work best

  const priceRateRatio = bn(rateTokenA).div(bn(rateTokenB))

  const eclpParams = eclpConfigForm.watch()
  const [alpha, beta, s, c, lambda] = [
    eclpParams.alpha,
    eclpParams.beta,
    eclpParams.s,
    eclpParams.c,
    eclpParams.lambda,
  ].map(Number)

  const tokenRateScalingFactorString = '1' // TODO: figure out if necessary?

  const liquidityData = useMemo(
    () =>
      drawLiquidityECLP(isGyroEclp, { alpha, beta, s, c, lambda }, tokenRateScalingFactorString),
    [isGyroEclp, alpha, beta, s, c, lambda, tokenRateScalingFactorString]
  )

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
    const margin = 0.00005 // if spot price is within the margin on both sides it's considered out of range

    return (
      bn(poolSpotPrice || 0).gt(xMin * (1 + margin)) &&
      bn(poolSpotPrice || 0).lt(xMax * (1 - margin))
    )
  }, [xMin, xMax, poolSpotPrice])

  return {
    data,
    poolSpotPrice: spotPriceWithoutRate.toString(),
    poolIsInRange,
    xMin,
    xMax,
    yMax,
    isReversed,
    toggleIsReversed: () => {}, // not needed because "isReversed" state managed by order of tokens in pool creation form
    isLoading: false,
    poolTokens: poolTokens.map(token => token.data?.symbol).filter(token => token !== undefined),
  }
}
