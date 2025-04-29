import { useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin } from './reclAmmMath'

export function useReclAmmChart() {
  const reclAmmData = useGetComputeReclAmmData()

  const currentChartData = useMemo(() => {
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
      return {}
    }

    const balanceA = formatUnits(reclAmmData.liveBalances.liveBalanceA, 18)
    const balanceB = formatUnits(reclAmmData.liveBalances.liveBalanceB, 18)

    const maxPrice = formatUnits(reclAmmData.priceRange[0], 18)
    const minPrice = formatUnits(reclAmmData.priceRange[1], 18)

    const priceRatio = bn(maxPrice).div(minPrice)

    const margin = formatUnits(reclAmmData.centerednessMargin, 16)

    const virtualBalanceA = formatUnits(reclAmmData.virtualBalances.virtualBalanceA, 18)
    const virtualBalanceB = formatUnits(reclAmmData.virtualBalances.virtualBalanceB, 18)

    const invariant = bn(bn(balanceA).plus(virtualBalanceA)).times(
      bn(balanceB).plus(virtualBalanceB)
    )

    const targetPrice = bn(bn(balanceB).plus(virtualBalanceB)).div(
      bn(balanceA).plus(virtualBalanceA)
    )

    console.log({
      balanceA,
      balanceB,
      virtualBalanceA,
      virtualBalanceB,
      invariant: invariant.toNumber(),
      priceRatio,
      margin,
      targetPrice,
    })

    const xForPointB = bn(invariant).div(virtualBalanceB)

    // Create regular curve points
    const curvePoints = Array.from({ length: 100 }, (_, i) => {
      const x = bn(0.7)
        .times(virtualBalanceA)
        .plus(
          bn(i)
            .times(bn(1.3).times(xForPointB).minus(bn(0.7).times(virtualBalanceA)))
            .div(bn(100))
        )
      const y = bn(invariant).div(x)

      return [x.toNumber(), y.toNumber()]
    })

    // Current points
    const currentMaxPrice = {
      x: Number(virtualBalanceA),
      y: Number(bn(invariant).div(virtualBalanceA)),
    }

    const currentXForPointB = bn(invariant).div(virtualBalanceB)
    const currentMinPrice = {
      x: currentXForPointB.toNumber(),
      y: Number(virtualBalanceB),
    }

    const currentLowerMargin = calculateLowerMargin({
      margin: Number(margin),
      invariant: invariant.toNumber(),
      virtualBalanceA: Number(virtualBalanceA),
      virtualBalanceB: Number(virtualBalanceB),
    })

    const currentUpperMargin = calculateUpperMargin({
      margin: Number(margin),
      invariant: invariant.toNumber(),
      virtualBalanceA: Number(virtualBalanceA),
      virtualBalanceB: Number(virtualBalanceB),
    })

    const currentLowerMarginPoint = {
      x: currentLowerMargin,
      y: bn(invariant).div(currentLowerMargin).toNumber(),
    }

    const currentUpperMarginPoint = {
      x: currentUpperMargin,
      y: bn(invariant).div(currentUpperMargin).toNumber(),
    }

    const currentBalances = {
      x: bn(balanceA).plus(virtualBalanceA).toNumber(),
      y: bn(balanceB).plus(virtualBalanceB).toNumber(),
    }

    return {
      series: curvePoints,
      currentMaxPrice,
      currentMinPrice,
      currentLowerMarginPoint,
      currentUpperMarginPoint,
      currentBalances,
    }
  }, [reclAmmData])

  console.log({ currentChartData })

  // Formatter for axis labels: 0 decimals if >= 10, 1 decimal if < 10
  const axisLabelFormatter = (value: number) => {
    return value >= 10 ? Math.round(value).toString() : value.toFixed(1)
  }

  const option = useMemo(() => {
    const series = currentChartData.series
    if (!series) return {}

    return {
      xAxis: {
        type: 'value',
        min: series[0][0],
        max: series[series.length - 1][0],
        axisLabel: {
          formatter: axisLabelFormatter,
        },
      },
      yAxis: {
        type: 'value',
        min: series[0][1],
        max: series[series.length - 1][1],
        axisLabel: {
          formatter: axisLabelFormatter,
        },
      },
      series: [
        {
          data: series,
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#1976d2',
            width: 3,
          },
          symbol: 'none',
        },
      ],
    }
  }, [currentChartData])

  return { option }
}
