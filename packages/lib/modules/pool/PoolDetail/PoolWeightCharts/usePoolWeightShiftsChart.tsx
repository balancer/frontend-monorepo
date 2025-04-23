import { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { getCompositionTokens } from '../../pool-tokens.utils'
import { isQuantAmmPool } from '../../pool.helpers'
import { QuantAmmWeightSnapshot } from '@repo/lib/shared/services/api/generated/graphql'
import { bn } from '@repo/lib/shared/utils/numbers'
import { secondsToMilliseconds } from 'date-fns'

const GRADIENTS = [
  {
    start: 'rgb(65, 105, 225)',
    end: 'rgb(30, 50, 100)',
  },
  {
    start: 'rgb(50, 205, 50)',
    end: 'rgb(25, 100, 25)',
  },
  {
    start: 'rgb(147, 112, 219)',
    end: 'rgb(75, 50, 130)',
  },
  {
    start: 'rgb(255, 165, 0)',
    end: 'rgb(180, 80, 0)',
  },
  {
    start: 'rgb(0, 128, 128)',
    end: 'rgb(0, 64, 64)',
  },
  {
    start: 'rgb(255, 105, 180)',
    end: 'rgb(180, 50, 120)',
  },
  {
    start: 'rgb(255, 105, 180)',
    end: 'rgb(180, 50, 120)',
  },
  {
    start: 'rgb(255, 215, 0)',
    end: 'rgb(180, 150, 0)',
  },
  {
    start: 'rgb(220, 20, 60)',
    end: 'rgb(139, 0, 0)',
  },
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

    const colors = GRADIENTS

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
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: colors[tokenIndex % colors.length].start,
            },
            {
              offset: 1,
              color: colors[tokenIndex % colors.length].end,
            },
          ]),
        },
        data,
      }
    })

    const option: EChartsOption = {
      color: colors.map(colorSet => colorSet.start),
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
            const value = param.value[1].toFixed(0) // no decimal places because of imprecise data from the backend
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
        padding: [5, 10, 0, 10],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '3%',
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
        //splitNumber: 10,
      },
      yAxis: [
        {
          type: 'value',
          name: 'Weight %',
          nameTextStyle: {
            color: '#999999',
          },
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
