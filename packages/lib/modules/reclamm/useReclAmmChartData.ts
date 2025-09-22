import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin, computeCenteredness } from './reclAmmMath'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { getPoolActionableTokens } from '@repo/lib/modules/pool/pool-tokens.utils'

const DEFAULT_PRICE_RATE = '1'

export type ReclAmmChartData =
  | {
      maxPriceValue: number
      minPriceValue: number
      lowerMarginValue: number
      upperMarginValue: number
      currentPriceValue: number
      isPoolWithinRange: boolean
      marginValue: number
      poolCenteredness: number
      isPoolAboveCenter: boolean
      isLoading: boolean
      isPoolWithinTargetRange: boolean
      poolTokens?: string[]
    }
  | undefined

export function useReclAmmChartData(): ReclAmmChartData {
  const reclAmmData = useGetComputeReclAmmData()
  const { pool } = usePool()

  return useMemo(() => {
    if (
      !reclAmmData.priceRange ||
      !reclAmmData.virtualBalances ||
      !reclAmmData.virtualBalances.virtualBalanceA ||
      !reclAmmData.virtualBalances.virtualBalanceB ||
      !reclAmmData.centerednessMargin ||
      !reclAmmData.liveBalances ||
      !reclAmmData.liveBalances.liveBalanceA ||
      !reclAmmData.liveBalances.liveBalanceB
    ) {
      return undefined
    }

    const balanceA = formatUnits(reclAmmData.liveBalances.liveBalanceA, 18)
    const balanceB = formatUnits(reclAmmData.liveBalances.liveBalanceB, 18)
    const margin = formatUnits(reclAmmData.centerednessMargin, 16)
    const virtualBalanceA = formatUnits(reclAmmData.virtualBalances.virtualBalanceA, 18)
    const virtualBalanceB = formatUnits(reclAmmData.virtualBalances.virtualBalanceB, 18)

    const invariant = bn(bn(balanceA).plus(virtualBalanceA)).times(
      bn(balanceB).plus(virtualBalanceB)
    )

    const rBalanceA = Number(balanceA)
    const rBalanceB = Number(balanceB)
    const vBalanceA = Number(virtualBalanceA)
    const vBalanceB = Number(virtualBalanceB)
    const marginValue = Number(margin)

    const lowerMargin = calculateLowerMargin({
      margin: marginValue,
      invariant: invariant.toNumber(),
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    const upperMargin = calculateUpperMargin({
      margin: marginValue,
      invariant: invariant.toNumber(),
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    let minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber()
    let maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber()

    let lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()
    let upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()

    let currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    // only scale back if token has rate but not an erc4626
    const tokenA = pool.poolTokens[0]
    const tokenB = pool.poolTokens[1]
    const tokenAHasRate = tokenA.priceRate !== DEFAULT_PRICE_RATE
    const tokenBHasRate = tokenB.priceRate !== DEFAULT_PRICE_RATE
    const shouldScaleBackTokenA = tokenAHasRate && !tokenA.isErc4626
    const shouldScaleBackTokenB = tokenBHasRate && !tokenB.isErc4626
    const shouldScaleBackPrices = shouldScaleBackTokenA || shouldScaleBackTokenB

    if (shouldScaleBackPrices) {
      // to scale back we use price * tokenARate / tokenBRate
      const tokenARate = shouldScaleBackTokenA ? tokenA.priceRate : DEFAULT_PRICE_RATE
      const tokenBRate = shouldScaleBackTokenB ? tokenB.priceRate : DEFAULT_PRICE_RATE
      const rateProviderScaleBackFactor = bn(tokenARate).div(tokenBRate)

      minPriceValue = rateProviderScaleBackFactor.times(minPriceValue).toNumber()
      maxPriceValue = rateProviderScaleBackFactor.times(maxPriceValue).toNumber()
      lowerMarginValue = rateProviderScaleBackFactor.times(lowerMarginValue).toNumber()
      upperMarginValue = rateProviderScaleBackFactor.times(upperMarginValue).toNumber()
      currentPriceValue = rateProviderScaleBackFactor.times(currentPriceValue).toNumber()
    }

    const isPoolWithinRange =
      (currentPriceValue > minPriceValue && currentPriceValue < lowerMarginValue) ||
      (currentPriceValue > upperMarginValue && currentPriceValue < maxPriceValue)

    const { poolCenteredness, isPoolAboveCenter } = computeCenteredness({
      balanceA: rBalanceA,
      balanceB: rBalanceB,
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    const poolTokens = getPoolActionableTokens(pool).map(token => token.symbol)

    return {
      maxPriceValue,
      minPriceValue,
      lowerMarginValue,
      upperMarginValue,
      currentPriceValue,
      isPoolWithinRange,
      marginValue,
      poolCenteredness,
      isPoolAboveCenter,
      isLoading: !!reclAmmData.isLoading,
      isPoolWithinTargetRange: !!reclAmmData.isPoolWithinTargetRange,
      poolTokens,
    }
  }, [reclAmmData, pool])
}
