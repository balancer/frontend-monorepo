import { useGetECLPLiquidityProfile } from '@repo/lib/modules/eclp/useGetECLPLiquidityProfile'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { usePool } from '../../../PoolProvider'
import { ColorMode, theme as defaultTheme, useTheme as useChakraTheme } from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'
import { getDefaultPoolChartOptions } from './usePoolCharts'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useMemo } from 'react'

export function useEclpPoolChart() {
  const { pool } = usePool()
  const { data, poolSpotPrice } = useGetECLPLiquidityProfile(pool)
  const { theme: nextTheme } = useNextTheme()
  const theme = useChakraTheme()
  const { toCurrency } = useCurrency()

  const defaultChartOptions = getDefaultPoolChartOptions(toCurrency, nextTheme as ColorMode, theme)

  const xMin = useMemo(() => (data ? Math.min(...data.map(([x]) => x)) : 0), [data])
  const xMax = useMemo(() => (data ? Math.max(...data.map(([x]) => x)) : 0), [data])
  //const yMin = useMemo(() => (data ? Math.min(...data.map(([, y]) => y)) : 0), [data])
  const yMax = useMemo(() => (data ? Math.max(...data.map(([, y]) => y)) : 0), [data])

  const boundedSpotPrice = useMemo(() => {
    if (poolSpotPrice) {
      if (bn(poolSpotPrice).gt(xMax)) return xMax
      if (bn(poolSpotPrice).lt(xMin)) return xMin
    }
    return poolSpotPrice
  }, [poolSpotPrice, xMax, xMin])

  const options = useMemo(() => {
    if (!data) return

    return {
      ...defaultChartOptions,
      grid: {
        left: '10%',
        right: '10%',
        top: '10%',
        bottom: '10%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const [data] = params
          return `Price: ${fNum('fiat', data.data[0])}\nLiquidity: ${fNum('fiat', data.data[1], { abbreviated: true })}`
        },
      },
      xAxis: {
        type: 'value',
        name: 'Price',
        nameLocation: 'middle',
        nameGap: 25,
        min: xMin - 0.1 * (xMax - xMin),
        max: xMax + 0.1 * (xMax - xMin),
        axisLabel: {
          formatter: (value: number) => fNum('token', value),
          color: defaultTheme.colors.gray[400],
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Liquidity',
        nameLocation: 'middle',
        nameGap: 50,
        min: 0,
        axisLabel: {
          formatter: (value: number) => fNum('fiat', value, { abbreviated: true }),
          color: defaultTheme.colors.gray[400],
        },
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          type: 'line',
          data,
          smooth: false,
          symbol: 'none',
          sampling: 'lttb',
          lineStyle: {
            width: 2,
            color: defaultTheme.colors.blue[400],
          },

          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(59, 130, 246, 0.3)',
                },
                {
                  offset: 0.5,
                  color: 'rgba(59, 130, 246, 0.1)',
                },
                {
                  offset: 1,
                  color: 'rgba(59, 130, 246, 0)',
                },
              ],
            },
          },
          markLine: {
            data: [
              // spotPrice
              [
                {
                  coord: [boundedSpotPrice, 0],
                },
                {
                  coord: [boundedSpotPrice, yMax],
                },
              ],
              // min
              [
                {
                  coord: [xMin, 0],
                },
                {
                  coord: [xMin, yMax],
                },
              ],
              // max
              [
                {
                  coord: [xMax, 0],
                },
                {
                  coord: [xMax, yMax],
                },
              ],
            ],
          },
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, boundedSpotPrice])

  return {
    options,
    hasChartData: !!data,
  }
}
