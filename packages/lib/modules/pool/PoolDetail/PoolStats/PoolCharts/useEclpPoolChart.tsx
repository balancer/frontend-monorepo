import { useGetECLPLiquidityProfile } from '@repo/lib/modules/eclp/useGetECLPLiquidityProfile'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { usePool } from '../../../PoolProvider'
import { ColorMode, useTheme as useChakraTheme } from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'
import { getDefaultPoolChartOptions } from './usePoolCharts'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useMemo } from 'react'
import { GqlPoolGyro } from '@repo/lib/shared/services/api/generated/graphql'

export function useEclpPoolChart() {
  const { pool } = usePool()
  const { data, poolSpotPrice } = useGetECLPLiquidityProfile(pool)
  const { theme: nextTheme } = useNextTheme()
  const theme = useChakraTheme()
  const { toCurrency } = useCurrency()

  const defaultChartOptions = getDefaultPoolChartOptions(toCurrency, nextTheme as ColorMode, theme)

  const tokens = useMemo(() => {
    const poolTokens = pool.poolTokens.map(token => token.symbol)
    const gyroPool = pool as GqlPoolGyro

    if (bn(gyroPool.alpha).lt(gyroPool.beta)) {
      return poolTokens.join('/')
    } else {
      return poolTokens.reverse().join('/')
    }
  }, [pool])

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

  const secondaryFontColor = theme.semanticTokens.colors.font.secondary.default

  const options = useMemo(() => {
    if (!data) return

    return {
      ...defaultChartOptions,
      grid: {
        left: '6.5%',
        right: '1.5%',
        top: '15%',
        bottom: '18%',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const [data] = params
          return `Price: ${fNum('gyroPrice', data.data[0])}\nLiquidity: ${toCurrency(data.data[1], { abbreviated: true })}`
        },
      },
      xAxis: {
        type: 'value',
        name: `Price (${tokens})`,
        nameLocation: 'end',
        nameGap: 5,
        nameTextStyle: {
          align: 'right',
          verticalAlign: 'bottom',
          padding: [0, 0, -54, 0],
        },
        min: xMin - 0.1 * (xMax - xMin),
        max: xMax + 0.1 * (xMax - xMin),
        axisLabel: {
          formatter: (value: number) => {
            const total = xMax - xMin
            const margin = total * 0.1

            if (value >= xMax - margin) return ''
            if (value <= xMin + margin) return ''

            if (
              bn(value).gt(bn(boundedSpotPrice || 0).minus(margin)) &&
              bn(value).lt(bn(boundedSpotPrice || 0).plus(margin))
            ) {
              return ''
            }

            return fNum('gyroPrice', value)
          },
          color: secondaryFontColor,
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: secondaryFontColor,
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Liquidity',
        nameLocation: 'end',
        nameGap: 5,
        nameTextStyle: {
          align: 'left',
          verticalAlign: 'top',
          padding: [-20, 0, 0, -50], // top, right, bottom, left
          color: theme.colors.gray[400],
        },
        min: 0,
        max: yMax * 1.25,
        axisLabel: {
          formatter: (value: number, index: number) =>
            index % 2 === 1 ? '-' : toCurrency(value, { abbreviated: true }),
          color: secondaryFontColor,
          align: 'left',
          margin: 48,
          interval: 0,
        },
        splitLine: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      series: [
        // lower bound
        {
          type: 'line',
          data: [],
          symbol: 'none',
          markLine: {
            symbol: ['none', 'triangle'],
            symbolSize: 6,
            symbolRotate: 180,
            silent: true,
            label: {
              show: true,
              fontSize: 12,
              color: theme.colors.gray[800],
              backgroundColor: theme.colors.gray[400],
              padding: [2, 3, 2, 3],
              borderRadius: 2,
              fontWeight: 'bold',
            },
            lineStyle: {
              color: theme.colors.gray[400],
              padding: [2, 0, 0, 0],
            },
            data: [
              [
                {
                  coord: [xMin, 0],
                  label: {
                    formatter: () => fNum('gyroPrice', xMin || '0'),
                    position: 'start',
                    distance: 5,
                    backgroundColor: 'rgb(179, 174, 245)',
                  },
                },
                {
                  coord: [xMin, yMax * 1.1],
                },
              ],
            ],
          },
        },
        // upper bound
        {
          type: 'line',
          data: [],
          symbol: 'none',
          markLine: {
            symbol: ['none', 'triangle'],
            symbolSize: 6,
            symbolRotate: 180,
            silent: true,
            label: {
              show: true,
              fontSize: 12,
              color: theme.colors.gray[800],
              backgroundColor: theme.colors.gray[400],
              padding: [2, 3, 2, 3],
              borderRadius: 2,
              fontWeight: 'bold',
            },
            lineStyle: {
              color: theme.colors.gray[400],
            },
            data: [
              [
                {
                  coord: [xMax, 0],
                  label: {
                    formatter: () => fNum('gyroPrice', xMax || '0'),
                    position: 'start',
                    distance: 5,
                    backgroundColor: 'rgb(234, 168, 121)',
                  },
                },
                {
                  coord: [xMax, yMax * 1.1],
                },
              ],
            ],
          },
        },
        // spot price
        {
          type: 'line',
          data: [],
          symbol: 'none',
          markPoint: {
            silent: true,
            symbol: 'rect',
            symbolSize: [60, 36],
            itemStyle: {
              color: 'transparent',
              borderWidth: 0,
            },
            // but markpoints for all 3 lines are here
            data: [
              {
                coord: [xMin, yMax * 1.22],
                value: 'Lower\nbound',
                label: {
                  show: true,
                  fontSize: 12,
                  color: secondaryFontColor,
                  padding: 4,
                  borderRadius: 4,
                },
              },
              {
                coord: [xMax, yMax * 1.22],
                value: 'Upper\nbound',
                label: {
                  show: true,
                  fontSize: 12,
                  color: secondaryFontColor,
                  padding: 4,
                  borderRadius: 4,
                },
              },
              {
                coord: [boundedSpotPrice, yMax * 1.22],
                value: 'Current\nprice',
                label: {
                  show: true,
                  fontSize: 12,
                  color: theme.colors.green[300],
                },
              },
            ],
          },
          markLine: {
            symbol: ['none', 'circle'],
            symbolSize: 6,
            symbolRotate: 0,
            silent: true,
            label: {
              show: true,
              fontSize: 12,
              color: theme.colors.gray[800],
              backgroundColor: theme.colors.green[300],
              padding: [2, 3, 2, 3],
              borderRadius: 2,
              fontWeight: 'bold',
            },
            lineStyle: {
              color: theme.colors.green[300],
            },
            data: [
              [
                {
                  coord: [boundedSpotPrice, 0],
                  label: {
                    formatter: () => fNum('gyroPrice', boundedSpotPrice || '0'),
                    position: 'start',
                    distance: 6,
                    backgroundColor: theme.colors.green[300],
                  },
                },
                {
                  coord: [boundedSpotPrice, yMax * 1.1],
                },
              ],
            ],
          },
        },
        // main chart
        {
          type: 'line',
          data,
          smooth: false,
          symbol: 'none',
          sampling: 'lttb',
          lineStyle: {
            width: 2,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgb(179, 174, 245)',
                },
                {
                  offset: 0.33,
                  color: 'rgb(215, 203, 231)',
                },
                {
                  offset: 0.66,
                  color: 'rgb(229, 200, 200)',
                },
                {
                  offset: 1,
                  color: 'rgb(234, 168, 121)',
                },
              ],
            },
          },
          z: 1000,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(179, 174, 245, 1)',
                },
                {
                  offset: 0.33,
                  color: 'rgba(215, 203, 231, 0.33)',
                },
                {
                  offset: 0.66,
                  color: 'rgba(229, 200, 200, 0.66)',
                },
                {
                  offset: 1,
                  color: 'rgba(234, 168, 121, 0)',
                },
              ],
            },
          },
          markLine: {
            silent: true,
            z: 1000,
            symbol: ['none', 'none'],
            data: [
              // left enclosing line for area
              [
                {
                  coord: [xMin, 0],
                  lineStyle: {
                    color: 'rgb(179, 174, 245)',
                    width: 2,
                    type: 'solid',
                  },
                },
                { coord: [xMin, data?.[0]?.[1] || 0] },
              ],
              // right enclosing line for area
              [
                {
                  coord: [xMax, 0],
                  lineStyle: {
                    color: 'rgb(234, 168, 121)',
                    width: 2,
                    type: 'solid',
                  },
                },
                { coord: [xMax, data?.[data.length - 1]?.[1] || 0] },
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
