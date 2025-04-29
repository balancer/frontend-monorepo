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

    // Find the x values for our key points
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

    // Find the closest points on the curve for our markPoints
    const markPointCoordinates = [
      { name: 'Max Price', x: vBalanceA },
      { name: 'Min Price', x: xForMinPrice },
      { name: 'Lower Margin', x: lowerMargin },
      { name: 'Upper Margin', x: upperMargin },
      { name: 'Current', x: currentBalance },
    ].map(point => {
      // Find the closest point on the curve
      const closestPoint = curvePoints.reduce((closest, current) => {
        return Math.abs(current[0] - point.x) < Math.abs(closest[0] - point.x) ? current : closest
      }, curvePoints[0])

      return {
        name: point.name,
        coord: closestPoint,
        value: point.name,
        itemStyle: {
          color: getColorForPoint(point.name),
        },
      }
    })

    return {
      series: curvePoints,
      markPointCoordinates,
    }
  }, [reclAmmData])

  // Helper function to get different colors for each point type
  function getColorForPoint(pointName: string) {
    switch (pointName) {
      case 'Max Price':
        return '#FF4560'
      case 'Min Price':
        return '#FF4560'
      case 'Lower Margin':
        return '#008FFB'
      case 'Upper Margin':
        return '#008FFB'
      case 'Current':
        return '#00E396'
      default:
        return '#1976d2'
    }
  }

  console.log({ currentChartData })

  // Formatter for axis labels: 0 decimals if >= 10, 1 decimal if < 10
  const axisLabelFormatter = (value: number) => {
    return value >= 10 ? Math.round(value).toString() : value.toFixed(1)
  }

  const option = useMemo(() => {
    const series = currentChartData.series
    if (!series) return {}

    // Calculate padding to ensure markPoints are visible
    const xValues = series.map(point => point[0])
    const yValues = series.map(point => point[1])

    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)

    // Add 10% padding to ensure points near edges are visible
    const xPadding = (xMax - xMin) * 0.1
    const yPadding = (yMax - yMin) * 0.1

    return {
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          if (params.componentType === 'markPoint') {
            return `${params.name}: (${params.coord[0].toFixed(2)}, ${params.coord[1].toFixed(2)})`
          }
          return `(${params.value[0].toFixed(2)}, ${params.value[1].toFixed(2)})`
        },
      },
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
          markPoint: {
            symbol: 'circle',
            symbolSize: 10,
            label: {
              show: false,
            },
            data: currentChartData.markPointCoordinates || [],
          },
        },
      ],
    }
  }, [currentChartData])

  return { option }
}
