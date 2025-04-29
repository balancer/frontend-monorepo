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

    console.log({ priceRatio, targetPrice })

    const xForPointB = bn(invariant).div(virtualBalanceB)

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

    const vBalanceA = Number(virtualBalanceA)
    const vBalanceB = Number(virtualBalanceB)
    const xForMinPrice = bn(invariant).div(virtualBalanceB).toNumber()

    const lowerMargin = calculateLowerMargin({
      margin: Number(margin),
      invariant: invariant.toNumber(),
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    const upperMargin = calculateUpperMargin({
      margin: Number(margin),
      invariant: invariant.toNumber(),
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    const currentBalance = bn(balanceA).plus(virtualBalanceA).toNumber()

    // separate marktpoint with interaction
    const currentPoint = {
      name: 'Current',
      x: currentBalance,
      coord: curvePoints.reduce((closest, current) => {
        return Math.abs(current[0] - currentBalance) < Math.abs(closest[0] - currentBalance)
          ? current
          : closest
      }, curvePoints[0]),
      itemStyle: {
        color: '#00E396',
      },
    }

    // other markpoint without interaction
    const otherPoints = [
      { name: 'Max Price', x: vBalanceA, color: '#FF4560' },
      { name: 'Min Price', x: xForMinPrice, color: '#FF4560' },
      { name: 'Lower Margin', x: lowerMargin, color: '#008FFB' },
      { name: 'Upper Margin', x: upperMargin, color: '#008FFB' },
    ].map(point => {
      const closestPoint = curvePoints.reduce((closest, current) => {
        return Math.abs(current[0] - point.x) < Math.abs(closest[0] - point.x) ? current : closest
      }, curvePoints[0])

      return {
        name: point.name,
        coord: closestPoint,
        itemStyle: {
          color: point.color,
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
      }
    })

    return {
      series: curvePoints,
      currentPoint,
      otherPoints,
    }
  }, [reclAmmData])

  // Formatter for axis labels: 0 decimals if >= 10, 1 decimal if < 10
  const axisLabelFormatter = (value: number) => {
    return value >= 10 ? Math.round(value).toString() : value.toFixed(1)
  }

  const option = useMemo(() => {
    const series = currentChartData.series
    if (!series) return {}

    const xValues = series.map(point => point[0])
    const yValues = series.map(point => point[1])

    const maxPricePoint = currentChartData.otherPoints?.find(p => p.name === 'Max Price')
    const minPricePoint = currentChartData.otherPoints?.find(p => p.name === 'Min Price')

    const xMin = maxPricePoint?.coord[0] || Math.min(...xValues)
    const yMax = maxPricePoint?.coord[1] || Math.max(...yValues)
    const xMax = minPricePoint?.coord[0] || Math.max(...xValues)
    const yMin = minPricePoint?.coord[1] || Math.min(...yValues)

    const xPadding = (xMax - xMin) * 0.1
    const yPadding = (yMax - yMin) * 0.1

    return {
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        min: xMin - xPadding,
        max: xMax + xPadding,
        axisLabel: {
          formatter: axisLabelFormatter,
        },
      },
      yAxis: {
        type: 'value',
        min: yMin - yPadding,
        max: yMax + yPadding,
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
          silent: true,
          tooltip: {
            show: false,
          },
          emphasis: {
            disabled: true,
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 10,
            label: {
              show: false,
            },
            data: currentChartData.otherPoints || [],
          },
        },
        {
          type: 'scatter',
          symbolSize: 10,
          symbol: 'circle',
          itemStyle: {
            color: '#00E396',
          },
          data: currentChartData.currentPoint ? [currentChartData.currentPoint.coord] : [],
          z: 10,
          tooltip: {
            formatter: function (params: any) {
              if (currentChartData.currentPoint && params.value) {
                return `Current Balance: (${params.value[0].toFixed(2)}, ${params.value[1].toFixed(2)})`
              }
              return ''
            },
          },
        },
      ],
    }
  }, [currentChartData])

  return { option }
}
