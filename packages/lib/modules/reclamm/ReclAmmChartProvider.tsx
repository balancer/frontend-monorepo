/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, PropsWithChildren, useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin } from './reclAmmMath'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'

type ReclAmmChartContextType = ReturnType<typeof _useReclAmmChart>

const ReclAmmChartContext = createContext<ReclAmmChartContextType | null>(null)

export function _useReclAmmChart() {
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

    const lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()
    const upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()

    const currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    const markPoints = [
      { name: 'upper limit', x: vBalanceA, color: '#FF4560', priceValue: maxPriceValue },
      { name: 'lower limit', x: xForMinPrice, color: '#FF4560', priceValue: minPriceValue },
      {
        name: 'higher target',
        x: lowerMargin,
        color: '#E67E22',
        priceValue: lowerMarginValue,
      },
      {
        name: 'lower target',
        x: upperMargin,
        color: '#E67E22',
        priceValue: upperMarginValue,
      },
      {
        name: 'current',
        x: currentBalance,
        priceValue: currentPriceValue,

        color: '#00E396',
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

    const maxPricePoint = currentChartData.markPoints?.find(p => p.name === 'upper limit')
    const minPricePoint = currentChartData.markPoints?.find(p => p.name === 'lower limit')

    const xMin = maxPricePoint?.coord[0] || Math.min(...xValues)
    const yMax = maxPricePoint?.coord[1] || Math.max(...yValues)
    const xMax = minPricePoint?.coord[0] || Math.max(...xValues)
    const yMin = minPricePoint?.coord[1] || Math.min(...yValues)

    const xPadding = (xMax - xMin) * 0.1
    const yPadding = (yMax - yMin) * 0.1

    return {
      grid: {
        left: '3%',
        right: '12%',
        bottom: '5%',
        top: '10%',
        containLabel: true,
      },
      visualMap: {
        show: false,
        dimension: 0,
        min: currentChartData.max,
        max: currentChartData.min,
        inRange: {
          color: ['#FF4560', '#FC7D02', '#93CE07', '#FC7D02', '#FF4560'],
        },
        controller: {
          inRange: {
            color: ['#FF4560', '#FC7D02', '#93CE07', '#FC7D02', '#FF4560'],
          },
        },
        pieces: [
          {
            lte: currentChartData.max,
            color: '#FF4560',
          },
          {
            gt: currentChartData.max,
            lte: currentChartData.lowerMargin,
            color: '#FC7D02',
          },
          {
            gt: currentChartData.lowerMargin,
            lte: currentChartData.upperMargin,
            color: '#93CE07',
          },
          {
            gt: currentChartData.upperMargin,
            lte: currentChartData.min,
            color: '#FC7D02',
          },
          {
            gt: currentChartData.min,
            color: '#FF4560',
          },
        ],
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
              distance: 10,
              formatter: function (params: any) {
                const pointName = params.name

                const point = currentChartData.markPoints?.find(p => p.name === pointName)
                if (point) {
                  return [
                    '{value|' + toCurrency(point.priceValue, { abbreviated: false }) + '}',
                    '{name|' + `(${pointName})` + '}',
                  ].join('\n')
                }

                return ''
              },
              rich: {
                value: {
                  color: '#333333',
                  fontWeight: 'bold',
                  fontSize: 12,
                  padding: [2, 0, 1, 0],
                  align: 'center',
                  width: 70,
                  textShadow: 'none',
                },
                name: {
                  color: '#333333',
                  fontSize: 12,
                  padding: [1, 0, 2, 0],
                  align: 'center',
                  width: 70,
                  textShadow: 'none',
                },
              },
              backgroundColor: function (params: any) {
                const point = currentChartData.markPoints?.find(p => p.name === params.name)
                const color = point?.itemStyle?.color || 'rgba(0, 0, 0, 0.75)'
                return color
              },
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              borderRadius: 4,
              padding: [4, 8],
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowOffsetX: 1,
              shadowOffsetY: 1,
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

  return {
    option,
    hasChartData: !!currentChartData.series?.length,
    isLoading: reclAmmData.isLoading,
    isPoolWithinTargetRange: reclAmmData.isPoolWithinTargetRange,
  }
}

export function ReclAmmChartProvider({ children }: PropsWithChildren) {
  const hook = _useReclAmmChart()
  return <ReclAmmChartContext.Provider value={hook}>{children}</ReclAmmChartContext.Provider>
}

export const useReclAmmChart = (): ReclAmmChartContextType =>
  useMandatoryContext(ReclAmmChartContext, 'ReclAmmChart')
