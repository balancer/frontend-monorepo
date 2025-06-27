/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, PropsWithChildren, useMemo } from 'react'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin } from './reclAmmMath'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'

type ReclAmmChartContextType = ReturnType<typeof useReclAmmChartLogic>

const ReclAmmChartContext = createContext<ReclAmmChartContextType | null>(null)

function getGradientColor(colorStops: string[]) {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: colorStops.map((color, index) => ({ offset: index, color })),
  }
}

export function useReclAmmChartLogic() {
  const { isMobile } = useBreakpoints()
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
    const margin = formatUnits(reclAmmData.centerednessMargin, 16)
    const virtualBalanceA = formatUnits(reclAmmData.virtualBalances.virtualBalanceA, 18)
    const virtualBalanceB = formatUnits(reclAmmData.virtualBalances.virtualBalanceB, 18)

    const invariant = bn(bn(balanceA).plus(virtualBalanceA)).times(
      bn(balanceB).plus(virtualBalanceB)
    )

    const vBalanceA = Number(virtualBalanceA)
    const vBalanceB = Number(virtualBalanceB)

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

    const minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber()
    const maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber()

    const lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()
    const upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()

    const currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    return {
      maxPriceValue,
      minPriceValue,
      lowerMarginValue,
      upperMarginValue,
      currentPriceValue,
    }
  }, [reclAmmData])

  const option = useMemo(() => {
    const { maxPriceValue, minPriceValue, lowerMarginValue, upperMarginValue, currentPriceValue } =
      currentChartData

    const baseGreyBarConfig = {
      count: 10,
      value: isMobile ? 1 : 3,
      gradientColors: ['rgba(160, 174, 192, 0.5)', 'rgba(160, 174, 192, 0.1)'],
      borderRadius: 20,
    }

    const baseOrangeBarConfig = {
      count: 8,
      value: 100,
      gradientColors: ['rgb(253, 186, 116)', 'rgba(151, 111, 69, 0.5)'],
      borderRadius: 20,
    }

    const greenBarConfig = {
      name: 'Green',
      count: 42,
      value: 100,
      gradientColors: ['rgb(99, 242, 190)', 'rgba(57, 140, 110, 0.5)'],
      borderRadius: 20,
    }

    const barSegmentsConfig = [
      { ...baseGreyBarConfig, name: 'Left Grey' },
      { ...baseOrangeBarConfig, name: 'Left Orange' },
      greenBarConfig,
      { ...baseOrangeBarConfig, name: 'Right Orange' },
      { ...baseGreyBarConfig, name: 'Right Grey' },
    ]

    const allCategories: string[] = []
    const seriesData: any[] = []
    let categoryNumber = 1

    // Calculate which bar the current price corresponds to
    const getCurrentPriceBarIndex = () => {
      const { minPriceValue, maxPriceValue, currentPriceValue } = currentChartData

      if (
        minPriceValue === undefined ||
        maxPriceValue === undefined ||
        currentPriceValue === undefined
      ) {
        return 50 // Default to middle if values are not available
      }

      const priceRange = maxPriceValue - minPriceValue
      const pricePerBar = priceRange / 58 // 58 bars in the colored section (8 orange + 42 green + 8 orange)
      const barsFromMin = (currentPriceValue - minPriceValue) / pricePerBar

      // Add the initial 10 grey bars and round to nearest bar
      const barIndex = Math.min(Math.max(0, Math.round(barsFromMin)), 57) + 10

      return barIndex
    }

    const currentPriceBarIndex = getCurrentPriceBarIndex()

    barSegmentsConfig.forEach(segment => {
      const segmentCategories: string[] = []
      const segmentStartIndex = allCategories.length

      for (let i = 0; i < segment.count; i++) {
        segmentCategories.push(String(categoryNumber++))
      }

      allCategories.push(...segmentCategories)

      const segmentSeriesData = Array(segment.count)
        .fill(null)
        .map((_, i) => {
          const isCurrentPriceBar = segmentStartIndex + i === currentPriceBarIndex

          return {
            value: segment.value,
            itemStyle: {
              color: isCurrentPriceBar
                ? '#93F6D2' // Solid color for current price bar
                : getGradientColor(segment.gradientColors),
              borderRadius: segment.borderRadius,
            },
          }
        })

      seriesData.push(...segmentSeriesData)
    })

    const baseRichProps = {
      fontSize: 12,
      lineHeight: 13,
      color: '#A0AEC0',
      align: 'center',
    }

    const paddingRight = isMobile ? 5 : 10

    const richStyles = {
      base: baseRichProps,
      triangle: {
        ...baseRichProps,
        fontSize: 10,
        lineHeight: 12,
        color: '#718096',
      },
      current: {
        ...baseRichProps,
        color: '#63F2BE',
      },
      currentTriangle: {
        ...baseRichProps,
        fontSize: 10,
        lineHeight: 12,
        color: '#63F2BE',
      },
      withRightPadding: {
        ...baseRichProps,
        padding: [0, paddingRight, 0, 0],
      },
      withRightBottomPadding: {
        ...baseRichProps,
        padding: [0, paddingRight, 10, 0],
      },
      withTopRightPadding: {
        ...baseRichProps,
        padding: [100, paddingRight, 0, 0],
      },
    }

    return {
      tooltip: { show: false },
      grid: {
        left: isMobile ? '-7%' : '-3%',
        right: '1%',
        top: isMobile ? '50px' : '15%',
        bottom: isMobile ? '-40px' : '8%',
        containLabel: true,
      },
      xAxis: {
        show: true,
        type: 'category',
        data: allCategories,
        position: 'bottom',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          show: true,
          interval: 0,
          formatter: (value: string, index: number) => {
            if (index === 10) {
              return `{${isMobile ? 'triangleMobile' : 'triangle'}|▲}\n{${isMobile ? 'labelTextMobile' : 'labelText'}|Min price}\n{${isMobile ? 'priceValueMobile' : 'priceValue'}|${minPriceValue !== undefined ? fNum('clpPrice', minPriceValue) : 'N/A'}}`
            }

            if (index === 18) {
              return `{triangle|▲}\n{labelText|Low target}\n{priceValue|${upperMarginValue !== undefined ? fNum('clpPrice', upperMarginValue) : 'N/A'}}`
            }

            if (index === 60) {
              return `{triangle|▲}\n{labelText|High target}\n{priceValue|${lowerMarginValue !== undefined ? fNum('clpPrice', lowerMarginValue) : 'N/A'}}`
            }

            if (index === 68) {
              return `{${isMobile ? 'triangleMobile' : 'triangle'}|▲}\n{${isMobile ? 'labelTextMobile' : 'labelText'}|Max price}\n{${isMobile ? 'priceValueMobile' : 'priceValue'}|${maxPriceValue !== undefined ? fNum('clpPrice', maxPriceValue) : 'N/A'}}`
            }

            return ''
          },
          rich: {
            triangle: {
              ...richStyles.triangle,
              ...richStyles.withRightBottomPadding,
            },
            labelText: {
              ...richStyles.base,
              ...richStyles.withRightBottomPadding,
            },
            priceValue: {
              ...richStyles.base,
              ...richStyles.withRightPadding,
            },
            triangleMobile: {
              ...richStyles.triangle,
              ...richStyles.withTopRightPadding,
            },
            labelTextMobile: {
              ...richStyles.base,
              ...richStyles.withTopRightPadding,
            },
            priceValueMobile: {
              ...richStyles.base,
              padding: [110, 10, 0, 0],
            },
          },
        },
      },
      yAxis: {
        show: false,
        type: 'value',
      },
      series: [
        {
          data: seriesData.map((value, index) => {
            if (index === currentPriceBarIndex) {
              return {
                ...value,
                label: {
                  show: true,
                  position: 'top',
                  formatter: `{labelText|Current price}\n{priceValue|${currentPriceValue !== undefined ? fNum('clpPrice', currentPriceValue) : 'N/A'}}\n{triangle|▼}`,
                  rich: {
                    triangle: {
                      ...richStyles.currentTriangle,
                    },
                    labelText: {
                      ...richStyles.current,
                      padding: [0, 0, 5, 0],
                    },
                    priceValue: {
                      ...richStyles.current,
                    },
                  },
                },
              }
            }

            return value
          }),
          type: 'bar',
          barWidth: '90%',
          barCategoryGap: '25%',
          silent: true,
        },
      ],
    }
  }, [currentChartData])

  return {
    option,
    hasChartData: !!currentChartData,
    isLoading: reclAmmData.isLoading,
    isPoolWithinTargetRange: !!reclAmmData.isPoolWithinTargetRange,
  }
}

export function ReclAmmChartProvider({ children }: PropsWithChildren) {
  const hook = useReclAmmChartLogic()
  return <ReclAmmChartContext.Provider value={hook}>{children}</ReclAmmChartContext.Provider>
}

export const useReclAmmChart = (): ReclAmmChartContextType =>
  useMandatoryContext(ReclAmmChartContext, 'ReclAmmChart')
