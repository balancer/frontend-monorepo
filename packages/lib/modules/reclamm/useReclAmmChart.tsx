/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin } from './reclAmmMath'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

export function useReclAmmChart() {
  const reclAmmData = useGetComputeReclAmmData()
  const { toCurrency } = useCurrency()

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

    //const maxPrice = formatUnits(reclAmmData.priceRange[0], 18)
    //const minPrice = formatUnits(reclAmmData.priceRange[1], 18)
    //const priceRatio = bn(maxPrice).div(minPrice)

    const margin = formatUnits(reclAmmData.centerednessMargin, 16)

    const virtualBalanceA = formatUnits(reclAmmData.virtualBalances.virtualBalanceA, 18)
    const virtualBalanceB = formatUnits(reclAmmData.virtualBalances.virtualBalanceB, 18)

    const invariant = bn(bn(balanceA).plus(virtualBalanceA)).times(
      bn(balanceB).plus(virtualBalanceB)
    )

    // Mathematical function for the curve: y = invariant / x
    const curveFunction = (x: number): number => {
      return invariant.div(bn(x)).toNumber()
    }

    const xForPointB = bn(invariant).div(virtualBalanceB)

    const curvePoints = Array.from({ length: 100 }, (_, i) => {
      const x = bn(0.7)
        .times(virtualBalanceA)
        .plus(
          bn(i)
            .times(bn(1.3).times(xForPointB).minus(bn(0.7).times(virtualBalanceA)))
            .div(bn(100))
        )
      const y = curveFunction(x.toNumber())

      return [x.toNumber(), y]
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

    const minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber()
    const maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber()

    const lowerMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()
    const upperMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()

    const currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    const markPoints = [
      {
        name: 'current',
        x: currentBalance,
        priceValue: currentPriceValue,

        color: '#00E396',
      },
      { name: 'max', x: vBalanceA, color: '#FF4560', priceValue: maxPriceValue },
      { name: 'min', x: xForMinPrice, color: '#FF4560', priceValue: minPriceValue },
      {
        name: 'lower margin',
        x: lowerMargin,
        color: '#E67E22',
        priceValue: lowerMarginValue,
      },
      {
        name: 'upper margin',
        x: upperMargin,
        color: '#E67E22',
        priceValue: upperMarginValue,
      },
    ].map(point => {
      return {
        name: point.name,
        coord: [point.x, curveFunction(point.x)],
        itemStyle: {
          color: point.color,
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
        priceValue: point.priceValue,
      }
    })

    return {
      series: curvePoints,
      markPoints,
      min: xForMinPrice,
      max: vBalanceA,
      lowerMargin,
      upperMargin,
    }
  }, [reclAmmData])

  const option = useMemo(() => {
    const series = currentChartData.series
    if (!series) return {}

    const xValues = series.map(point => point[0])
    const yValues = series.map(point => point[1])

    const maxPricePoint = currentChartData.markPoints?.find(p => p.name === 'max')
    const minPricePoint = currentChartData.markPoints?.find(p => p.name === 'min')

    const xMin = maxPricePoint?.coord[0] || Math.min(...xValues)
    const yMax = maxPricePoint?.coord[1] || Math.max(...yValues)
    const xMax = minPricePoint?.coord[0] || Math.max(...xValues)
    const yMin = minPricePoint?.coord[1] || Math.min(...yValues)

    const xPadding = (xMax - xMin) * 0.1
    const yPadding = (yMax - yMin) * 0.1

    return {
      grid: {
        left: '5%',
        right: '30%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        min: xMin - xPadding,
        max: xMax + xPadding,
        axisLabel: {
          show: true,
          showMinLabel: false,
          showMaxLabel: false,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#666',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#666',
            opacity: 0.3,
          },
        },
        axisTick: {
          show: true,
        },
      },
      yAxis: {
        type: 'value',
        min: yMin - yPadding,
        max: yMax + yPadding,
        axisLabel: {
          show: true,
          // remove min and max labels instead of hiding them
          formatter: function (value: number) {
            if (value === yMin - yPadding || value === yMax + yPadding) {
              return ''
            }
            return value
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#666',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#666',
            opacity: 0.3,
          },
        },
        axisTick: {
          show: true,
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
            data: currentChartData.markPoints,
          },
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              show: true,
              position: 'end',
              formatter: function (params: any) {
                const pointName = params.name

                const point = currentChartData.markPoints?.find(p => p.name === pointName)
                if (point) {
                  return `${toCurrency(point.priceValue, { abbreviated: false })} (${pointName})`
                }

                return ''
              },
              backgroundColor: 'auto',
              padding: [3, 6],
              borderRadius: 3,
              color: '#000',
              fontSize: 12,
            },
            data: [
              ...(currentChartData.markPoints || []).map(point => ({
                name: point.name,
                yAxis: point.coord[1],

                lineStyle: {
                  color: point.itemStyle.color,
                },
                label: {
                  backgroundColor: point.itemStyle.color,
                },
              })),
            ],
          },
        },
      ],
    }
  }, [currentChartData])

  return { option }
}
