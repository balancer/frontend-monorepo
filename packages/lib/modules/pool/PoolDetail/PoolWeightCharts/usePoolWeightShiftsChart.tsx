import { EChartsOption } from 'echarts'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { getCompositionTokens } from '../../pool-tokens.utils'
import { isQuantAmmPool } from '../../pool.helpers'
import { QuantAmmWeightSnapshot } from '@repo/lib/shared/services/api/generated/graphql'
import { bn } from '@repo/lib/shared/utils/numbers'
import { secondsToMilliseconds } from 'date-fns'

const COLORS = [
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#039BE5',
  '#00ACC1',
  '#00897B',
]

export function usePoolWeightShiftsChart(): { option: EChartsOption } {
  const { pool } = usePool()

  const compositionTokens = getCompositionTokens(pool)

  const { option } = useMemo(() => {
    if (!isQuantAmmPool(pool.type)) {
      return { option: {} as EChartsOption }
    }

    const snapshots = (pool as any).weightSnapshots as QuantAmmWeightSnapshot[]
    if (!snapshots || snapshots.length === 0) {
      return { option: {} as EChartsOption }
    }

    const series = compositionTokens.map((token, tokenIndex) => {
      const data = snapshots.map(snapshot => {
        const weight = snapshot.weights?.[tokenIndex]
        const weightPercent = weight ? Number(bn(weight).times(100).toFixed(4)) : 0 // to smooth the chart areas
        return [secondsToMilliseconds(snapshot.timestamp), weightPercent]
      })

      return {
        name: token.symbol,
        type: 'line' as const,
        stack: 'weight',
        smooth: true,
        lineStyle: {
          width: 0.5,
          color: '#000000',
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: COLORS[tokenIndex % COLORS.length],
        },
        emphasis: {
          focus: 'series' as const,
        },
        data,
      }
    })

    const option: EChartsOption = {
      color: COLORS,
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const date = new Date(params[0].value[0])
          const formattedDate = date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          })

          let result = `<div style="font-weight: bold;">${formattedDate}</div>`

          const reversedParams = [...params].reverse()

          reversedParams.forEach((param: any) => {
            const color = param.color
            const seriesName = param.seriesName
            const value = param.value[1].toFixed(2)
            result += `<div style="display: flex; align-items: center; margin: 3px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-right: 5px;"></span>
              <span style="margin-right: 5px;">${seriesName}:</span>
              <span style="font-weight: bold;">${value}%</span>
            </div>`
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
        padding: [0, 0, 5, 45],
        icon: 'pin',
      },
      grid: {
        left: '1%',
        right: '3%',
        bottom: '10%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: function (value: number) {
            const date = new Date(value)
            if (date.getHours() === 0 && date.getMinutes() === 0) {
              return date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            }
            return ''
          },
          fontSize: 12,
          color: '#999999',
          margin: 12,
          align: 'center',
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
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20,
          axisLabel: {
            formatter: '{value}%',
            color: '#999999',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#999999',
            },
          },
          splitLine: {
            lineStyle: {
              color: ['#f5f5f5'],
              type: 'dashed',
            },
          },
        },
      ],
      series,
    }

    return { option }
  }, [pool, compositionTokens])

  return { option }
}
