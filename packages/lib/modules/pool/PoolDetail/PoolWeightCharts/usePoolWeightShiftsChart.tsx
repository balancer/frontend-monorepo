import * as echarts from 'echarts/core'
import { useMemo } from 'react'
import { EChartsOption, LineSeriesOption } from 'echarts'
import { usePool } from '../../PoolProvider'
import { getCompositionTokens } from '../../pool-tokens.utils'
import { isQuantAmmPool } from '../../pool.helpers'
import { QuantAmmWeightSnapshot } from '@repo/lib/shared/services/api/generated/graphql'
import { bn } from '@repo/lib/shared/utils/numbers'

// Define 8 static gradient sets
const GRADIENTS = [
  // Blue gradient
  {
    start: 'rgb(65, 105, 225)', // Royal Blue
    end: 'rgb(30, 50, 100)', // Dark Blue
  },
  // Green gradient
  {
    start: 'rgb(50, 205, 50)', // Lime Green
    end: 'rgb(25, 100, 25)', // Dark Green
  },
  // Purple gradient
  {
    start: 'rgb(147, 112, 219)', // Medium Purple
    end: 'rgb(75, 50, 130)', // Dark Purple
  },
  // Orange gradient
  {
    start: 'rgb(255, 165, 0)', // Orange
    end: 'rgb(180, 80, 0)', // Dark Orange
  },
  // Teal gradient
  {
    start: 'rgb(0, 128, 128)', // Teal
    end: 'rgb(0, 64, 64)', // Dark Teal
  },
  // Pink gradient
  {
    start: 'rgb(255, 105, 180)', // Hot Pink
    end: 'rgb(180, 50, 120)', // Dark Pink
  },
  // Yellow gradient
  {
    start: 'rgb(255, 215, 0)', // Gold
    end: 'rgb(180, 150, 0)', // Dark Gold
  },
  // Red gradient
  {
    start: 'rgb(220, 20, 60)', // Crimson
    end: 'rgb(139, 0, 0)', // Dark Red
  },
]

export function usePoolWeightShiftsChart(): { option: EChartsOption } {
  const { pool } = usePool()

  const compositionTokens = getCompositionTokens(pool)

  const series = useMemo(() => {
    if (!isQuantAmmPool(pool.type)) {
      return []
    }

    return compositionTokens.map((token, tokenIndex) => {
      const data = ((pool as any).weightSnapshots as QuantAmmWeightSnapshot[]).map(
        (snapshot, index) => {
          const weight = snapshot.weights?.[tokenIndex]
          const weightPercent = weight ? Number(bn(weight).times(100).toFixed(0)) : 0

          return [index, weightPercent]
        }
      )

      const gradientIndex = tokenIndex % GRADIENTS.length
      const gradient = GRADIENTS[gradientIndex]

      return {
        name: token.symbol,
        type: 'line' as const,
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: gradient.start,
            },
            {
              offset: 1,
              color: gradient.end,
            },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
        data: data,
      } as LineSeriesOption
    })
  }, [compositionTokens, pool])

  const { xAxisLabels, labelIndices } = useMemo(() => {
    if (!isQuantAmmPool(pool.type)) {
      return { xAxisLabels: [], labelIndices: [] }
    }

    const snapshots = (pool as any).weightSnapshots as QuantAmmWeightSnapshot[]
    if (!snapshots || snapshots.length === 0) {
      return { xAxisLabels: [], labelIndices: [] }
    }

    const labels = Array(snapshots.length).fill('')
    const indices: number[] = []

    const seenDates = new Set<string>()

    // Process all snapshots to find date changes
    snapshots.forEach((snapshot, index) => {
      try {
        const date = new Date(snapshot.timestamp * 1000)
        if (!isNaN(date.getTime())) {
          const dateString = date.toISOString().split('T')[0]

          if (!seenDates.has(dateString)) {
            seenDates.add(dateString)

            const formattedDate = date.toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
            })

            labels[index] = formattedDate
            indices.push(index)
          }
        }
      } catch (e) {
        // Ignore invalid dates
      }
    })

    return { xAxisLabels: labels, labelIndices: indices }
  }, [pool])

  const option: EChartsOption = {
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.5)',
          width: 1,
          type: 'dashed',
        },
        label: {
          show: false,
        },
      },
      formatter: function (params: any) {
        if (params.length === 0) return ''

        const index = params[0].dataIndex
        const snapshot = ((pool as any).weightSnapshots as QuantAmmWeightSnapshot[])[index]

        let timeLabel = ''
        if (snapshot) {
          try {
            const date = new Date(snapshot.timestamp * 1000)
            if (!isNaN(date.getTime())) {
              // Set minutes and seconds to 0 to get top of the hour
              date.setMinutes(0)
              date.setSeconds(0)

              timeLabel = date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            } else {
              timeLabel = String(snapshot.timestamp)
            }
          } catch (e) {
            timeLabel = String(snapshot.timestamp)
          }
        }

        let result = timeLabel + '<br/>'

        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${param.value[1].toFixed(2)}%<br/>`
        })

        return result
      },
    },
    legend: {
      data: compositionTokens.map(token => token.symbol),
      textStyle: {
        color: '#999999',
      },
      left: 'left',
      bottom: '0',
      orient: 'horizontal',
      padding: [5, 10, 0, 10],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: Array.from(
          { length: ((pool as any).weightSnapshots as QuantAmmWeightSnapshot[])?.length || 0 },
          (_, i) => i
        ),
        axisLabel: {
          formatter: function (value: any) {
            const index = parseInt(value)
            return xAxisLabels[index] || ''
          },
          fontSize: 12,
          color: '#999999',
          margin: 12,
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          interval: function (index: number) {
            return labelIndices.includes(index)
          },
          lineStyle: {
            color: '#999999',
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#999999',
            width: 1,
          },
        },
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          formatter: '{value}%',
          fontSize: 12,
          color: '#999999',
          margin: 12,
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#999999',
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#999999',
            width: 1,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(153, 153, 153, 0.2)',
            type: 'dashed',
            width: 1,
          },
        },
        min: 0,
        max: function (value: { max: number }) {
          return value.max
        },
      },
    ],
    series,
  }

  return { option }
}
