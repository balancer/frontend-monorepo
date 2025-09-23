import { useMemo } from 'react'
import {
  calculateLowerMargin,
  calculateUpperMargin,
  computeCenteredness,
} from '@repo/lib/modules/reclamm/reclAmmMath'
import { calculateInitialBalances } from '@repo/lib/modules/reclamm/reclAmmMath'
import { bn } from '@repo/lib/shared/utils/numbers'
import { usePoolCreationForm } from '../PoolCreationFormProvider'

export function usePreviewReclAmmChartData() {
  const { reClammConfigForm } = usePoolCreationForm()
  const { initialMinPrice, initialMaxPrice, initialTargetPrice, centerednessMargin } =
    reClammConfigForm.watch()

  return useMemo(() => {
    if (
      !initialMinPrice ||
      !initialMaxPrice ||
      !initialTargetPrice ||
      Number(centerednessMargin) > 90
    ) {
      return undefined
    }

    const { balanceA, balanceB, virtualBalanceA, virtualBalanceB } = calculateInitialBalances({
      minPrice: Number(initialMinPrice),
      maxPrice: Number(initialMaxPrice),
      targetPrice: Number(initialTargetPrice),
    })

    const invariant = bn(bn(balanceA).plus(virtualBalanceA)).times(
      bn(balanceB).plus(virtualBalanceB)
    )

    const rBalanceA = balanceA
    const rBalanceB = balanceB
    const vBalanceA = virtualBalanceA
    const vBalanceB = virtualBalanceB
    const marginValue = Number(centerednessMargin)

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

    const minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber()
    const maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber()

    const lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()

    const upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()

    const currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    const isPoolWithinRange =
      (currentPriceValue > minPriceValue && currentPriceValue < lowerMarginValue) ||
      (currentPriceValue > upperMarginValue && currentPriceValue < maxPriceValue)

    const { poolCenteredness, isPoolAboveCenter } = computeCenteredness({
      balanceA: rBalanceA,
      balanceB: rBalanceB,
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    const isPoolWithinTargetRange =
      currentPriceValue > upperMarginValue && currentPriceValue < lowerMarginValue

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
      isLoading: false,
      isPoolWithinTargetRange,
    }
  }, [initialMinPrice, initialMaxPrice, initialTargetPrice, centerednessMargin])
}
