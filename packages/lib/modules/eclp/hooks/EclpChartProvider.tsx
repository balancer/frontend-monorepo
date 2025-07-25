import { useGetECLPLiquidityProfile } from '@repo/lib/modules/eclp/hooks/useGetECLPLiquidityProfile'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { usePool } from '../../pool/PoolProvider'
import { useTheme as useChakraTheme } from '@chakra-ui/react'
import { createContext, PropsWithChildren, useMemo } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { getPoolActionableTokens } from '../../pool/pool-tokens.utils'
import { useSelectColor } from '@repo/lib/shared/hooks/useSelectColor'

type EclpChartContextType = ReturnType<typeof useEclpChartLogic>

const EclpChartContext = createContext<EclpChartContextType | null>(null)

export function useEclpChartLogic() {
  const { pool } = usePool()

  const {
    data,
    poolSpotPrice,
    poolIsInRange,
    xMin,
    xMax,
    yMax,
    isReversed,
    toggleIsReversed,
    isLoading,
  } = useGetECLPLiquidityProfile(pool)
  const theme = useChakraTheme()
  const selectColor = useSelectColor()
  const tokens = useMemo(() => {
    const poolTokens = getPoolActionableTokens(pool).map(token => token.symbol)

    return isReversed ? poolTokens.reverse().join(' / ') : poolTokens.join(' / ')
  }, [pool, isReversed])

  const secondaryFontColor = selectColor('font', 'secondary')

  const fontHighlightColor = selectColor('font', 'highlight')

  const backgroundHighlightColor = selectColor('background', 'highlight')

  const markPointMargin = 0.05
  const isSpotPriceNearLowerBound = useMemo(() => {
    return bn(poolSpotPrice || 0).lt(xMin * (1 + markPointMargin))
  }, [poolSpotPrice, xMin])

  const isSpotPriceNearUpperBound = useMemo(() => {
    return bn(poolSpotPrice || 0).gt(xMax * (1 - markPointMargin))
  }, [poolSpotPrice, xMax])

  const toolTipTheme = {
    heading: 'font-weight: bold; color: #E5D3BE',
    container: `background: ${theme.colors.gray[800]};`,
    text: theme.colors.gray[400],
  }

  const options = useMemo(() => {
    if (!data) return

    return {
      grid: {
        left: '1%',
        right: '1%',
        top: '7%',
        bottom: '9%',
      },
      tooltip: {
        show: true,
        showContent: true,
        trigger: 'axis',
        confine: true,
        extraCssText: `padding-right:2rem;border: none;${toolTipTheme.container}`,
        formatter: (params: any) => {
          const data = Array.isArray(params) ? params[0] : params
          return `
            <div style="padding: none; display: flex; flex-direction: column; justify-content: center;${
              toolTipTheme.container
            }">
              <div style="font-size: 14px; font-weight: 500; color: ${toolTipTheme.text};">
                ${fNum('tokenRatio', data.data[0])}
              </div>
            </div>
          `
        },
      },
      xAxis: {
        type: 'value',
        min: xMin - 0.1 * (xMax - xMin),
        max: xMax + 0.1 * (xMax - xMin),
        axisLabel: {
          formatter: (value: number) => {
            const total = xMax - xMin
            const margin = total * 0.1

            if (value >= xMax - margin) return ''
            if (value <= xMin + margin) return ''

            if (
              bn(value).gt(bn(poolSpotPrice || 0).minus(margin)) &&
              bn(value).lt(bn(poolSpotPrice || 0).plus(margin))
            ) {
              return ''
            }

            return fNum('tokenRatio', value)
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
        min: 0,
        max: yMax * 1.25,
        axisLabel: {
          show: false,
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
              offset: [0, 1],
            },
            lineStyle: {
              color: 'rgba(179, 174, 245, 0.5)',
              padding: [2, 0, 0, 0],
            },
            data: [
              [
                {
                  coord: [xMin, 0],
                  label: {
                    formatter: () => fNum('tokenRatio', xMin || '0'),
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
              offset: [0, 1],
            },
            lineStyle: {
              color: 'rgba(234, 168, 121, 0.5)',
            },
            data: [
              [
                {
                  coord: [xMax, 0],
                  label: {
                    formatter: () => fNum('tokenRatio', xMax || '0'),
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
                  show: !isSpotPriceNearLowerBound || !poolIsInRange,
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
                  show: !isSpotPriceNearUpperBound || !poolIsInRange,
                  fontSize: 12,
                  color: 'secondaryFontColor',
                  padding: 4,
                  borderRadius: 4,
                },
              },
              {
                coord: [poolSpotPrice, yMax * 1.22],
                value: 'Current\nprice',
                label: {
                  show: poolIsInRange,
                  fontSize: 12,
                  color: fontHighlightColor,
                },
              },
            ],
          },
          markLine: poolIsInRange
            ? {
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
                  color: fontHighlightColor,
                },
                data: [
                  [
                    {
                      coord: [poolSpotPrice, 0],
                      label: {
                        formatter: () => fNum('tokenRatio', poolSpotPrice || '0'),
                        position: 'start',
                        distance: 6,
                        backgroundColor: backgroundHighlightColor,
                      },
                    },
                    {
                      coord: [poolSpotPrice, yMax * 1.1],
                    },
                  ],
                ],
              }
            : undefined,
        },
        // main chart
        {
          type: 'line',
          data,
          smooth: false,
          symbol: 'none',
          sampling: 'lttb',
          silent: true,
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
                  offset: 0.2,
                  color: 'rgb(197, 189, 238)',
                },
                {
                  offset: 0.4,
                  color: 'rgb(215, 203, 231)',
                },
                {
                  offset: 0.6,
                  color: 'rgb(222, 202, 216)',
                },
                {
                  offset: 0.8,
                  color: 'rgb(229, 185, 169)',
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
                  color: 'rgba(179, 174, 245, 0.8)',
                },
                {
                  offset: 0.2,
                  color: 'rgba(197, 189, 238, 0.6)',
                },
                {
                  offset: 0.4,
                  color: 'rgba(215, 203, 231, 0.4)',
                },
                {
                  offset: 0.6,
                  color: 'rgba(222, 202, 216, 0.25)',
                },
                {
                  offset: 0.8,
                  color: 'rgba(229, 185, 169, 0.15)',
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
  }, [data, poolSpotPrice])

  const outOfRangeText =
    'The current price is out of the set liquidity range for this Concentrated Liquidity Pool (CLP). When a CLP is not in range, liquidity is not routed through this pool and LPs do not earn swap fees.'
  const inRangeText =
    'The current price is between the liquidity upper and lower bounds for this Concentrated Liquidity Pool (CLP). In range pools earn high swap fees.'

  return {
    options,
    hasChartData: data?.length,
    poolIsInRange,
    toggleIsReversed,
    isLoading,
    outOfRangeText,
    inRangeText,
    tokens,
  }
}

export function EclpChartProvider({ children }: PropsWithChildren) {
  const hook = useEclpChartLogic()
  return <EclpChartContext.Provider value={hook}>{children}</EclpChartContext.Provider>
}

export const useEclpChart = (): EclpChartContextType =>
  useMandatoryContext(EclpChartContext, 'EclpChart')
