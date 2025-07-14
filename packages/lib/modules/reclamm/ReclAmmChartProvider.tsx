/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, PropsWithChildren, useMemo, useState } from 'react'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin, computeCenteredness } from './reclAmmMath'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useSelectColor } from '@repo/lib/shared/hooks/useSelectColor'
import { getPoolActionableTokens } from '@repo/lib/modules/pool/pool-tokens.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useBreakpointValue } from '@chakra-ui/react'

const GREEN = '#93F6D2'
const ORANGE = 'rgb(253, 186, 116)'

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
  const [isReversed, setIsReversed] = useState(false)
  const selectColor = useSelectColor()
  const { pool } = usePool()

  const dynamicXAxisNamePadding = useBreakpointValue({
    base: [0, 30, -128, 0],
    md: [0, 30, -128, 0],
    lg: [0, 24, -80, 0],
  }) || [0, 24, -80, 0]

  const secondaryFontColor = selectColor('font', 'secondary')

  function toggleIsReversed() {
    setIsReversed(!isReversed)
  }

  const tokens = useMemo(() => {
    const poolTokens = getPoolActionableTokens(pool).map(token => token.symbol)

    return isReversed ? poolTokens.reverse().join('/') : poolTokens.join('/')
  }, [pool, isReversed])

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

    const rBalanceA = Number(balanceA)
    const rBalanceB = Number(balanceB)
    const vBalanceA = Number(virtualBalanceA)
    const vBalanceB = Number(virtualBalanceB)
    const marginValue = Number(margin)

    const lowerMargin = calculateLowerMargin({
      margin: marginValue,
      invariant: invariant.toNumber(),
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    const upperMargin = calculateUpperMargin({
      margin: marginValue,
      invariant: invariant.toNumber(),
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    let minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber()
    let maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber()

    let lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()
    let upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()

    let currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    if (isReversed) {
      const invert = (value: number) => (value === 0 ? 0 : 1 / value)

      const invertedMinPriceValue = invert(maxPriceValue)
      const invertedMaxPriceValue = invert(minPriceValue)
      const invertedLowerMarginValue = invert(upperMarginValue)
      const invertedUpperMarginValue = invert(lowerMarginValue)

      // Swap min/max and lower/upper
      minPriceValue = invertedMinPriceValue
      maxPriceValue = invertedMaxPriceValue
      lowerMarginValue = invertedLowerMarginValue
      upperMarginValue = invertedUpperMarginValue
      currentPriceValue = invert(currentPriceValue)
    }

    const isPoolWithinRange =
      (currentPriceValue > minPriceValue && currentPriceValue < lowerMarginValue) ||
      (currentPriceValue > upperMarginValue && currentPriceValue < maxPriceValue)

    const { poolCenteredness, isPoolAboveCenter } = computeCenteredness({
      balanceA: rBalanceA,
      balanceB: rBalanceB,
      virtualBalanceA: vBalanceA,
      virtualBalanceB: vBalanceB,
    })

    return {
      maxPriceValue,
      minPriceValue,
      lowerMarginValue,
      upperMarginValue,
      currentPriceValue,
      isPoolWithinRange,
      marginValue,
      poolCenteredness,
      isPoolAboveCenter,
    }
  }, [reclAmmData])

  const options = useMemo(() => {
    const {
      maxPriceValue,
      minPriceValue,
      lowerMarginValue,
      upperMarginValue,
      currentPriceValue,
      marginValue, // is a true percentage
      isPoolWithinRange,
    } = currentChartData

    const isPriceAdjusting = isPoolWithinRange && !reclAmmData.isPoolWithinTargetRange

    let showTargetValues = true
    let showMinMaxValues = true
    const totalGreenAndOrangeBars = 52

    // always have a minimum of 1 orange bar
    const baseOrangeBarCount =
      marginValue && marginValue < 4
        ? 1
        : Math.floor((totalGreenAndOrangeBars * (marginValue || 0)) / 100 / 2)

    // if the margin is very small or very big, show only the target values or min/max values depending on the pool state
    if (marginValue && marginValue < 4) {
      if (reclAmmData.isPoolWithinTargetRange) {
        showTargetValues = true
        showMinMaxValues = false
      } else if (isPoolWithinRange) {
        showTargetValues = false
        showMinMaxValues = true
      }
    } else if (marginValue && marginValue > 92) {
      showTargetValues = false
      showMinMaxValues = true
    }

    const baseGreenBarCount = totalGreenAndOrangeBars - 2 * baseOrangeBarCount
    const baseGreyBarCount = 9
    const totalBars = 2 * baseGreyBarCount + 2 * baseOrangeBarCount + baseGreenBarCount

    // for some reason the number of orange (or green) bars matters to echarts in the grid
    const gridBottomDesktop = baseOrangeBarCount % 2 === 0 ? '19.5%' : '8%'
    const gridBottomMobile =
      baseOrangeBarCount % 2 === 0 && !(showMinMaxValues && !showTargetValues) ? '24.5%' : '16%'

    const baseGreyBarConfig = {
      count: baseGreyBarCount,
      value: isMobile ? 1 : 3,
      gradientColors: ['rgba(160, 174, 192, 0.5)', 'rgba(160, 174, 192, 0.1)'],
      borderRadius: 20,
    }

    const baseOrangeBarConfig = {
      count: baseOrangeBarCount,
      value: 100,
      gradientColors: ['rgb(253, 186, 116)', 'rgba(151, 111, 69, 0.5)'],
      borderRadius: 20,
    }

    const greenBarConfig = {
      name: 'Green',
      count: baseGreenBarCount,
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
      const { poolCenteredness = 0, isPoolAboveCenter = false } = currentChartData || {}

      const totalGreenAndOrangeBars = 2 * baseOrangeBarCount + baseGreenBarCount
      let barIndex = 0

      if (isPoolAboveCenter) {
        barIndex = Math.floor((poolCenteredness / 2) * totalGreenAndOrangeBars)
      } else {
        barIndex = Math.floor(((2 - poolCenteredness) / 2) * totalGreenAndOrangeBars)
      }

      return (isReversed ? totalGreenAndOrangeBars - barIndex - 1 : barIndex) + baseGreyBarCount
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
              color: isCurrentPriceBar // Solid color for current price bar
                ? isPriceAdjusting
                  ? ORANGE
                  : GREEN
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
        color: isPriceAdjusting ? ORANGE : GREEN,
      },
      currentTriangle: {
        ...baseRichProps,
        fontSize: 10,
        lineHeight: 12,
        color: isPriceAdjusting ? ORANGE : GREEN,
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
        padding: [showMinMaxValues && !showTargetValues ? 0 : 100, paddingRight, 0, 0],
      },
    }

    return {
      tooltip: { show: false },
      grid: {
        left: isMobile ? '-7%' : '-3%',
        right: '1%',
        top: isMobile ? '50px' : '15%',
        bottom: isMobile ? gridBottomMobile : gridBottomDesktop,
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
            if (showMinMaxValues && index === baseGreyBarCount) {
              return `{${isMobile ? 'triangleMobile' : 'triangle'}|▲}\n{${isMobile ? 'labelTextMobile' : 'labelText'}|Min price}\n{${isMobile ? 'priceValueMobile' : 'priceValue'}|${minPriceValue !== undefined ? fNum('tokenRatio', minPriceValue) : 'N/A'}}`
            }

            if (showTargetValues && index === baseGreyBarCount + baseOrangeBarCount) {
              return `{triangle|▲}\n{labelText|Low target}\n{priceValue|${upperMarginValue !== undefined ? fNum('tokenRatio', upperMarginValue) : 'N/A'}}`
            }

            if (showTargetValues && index === totalBars - baseGreyBarCount - baseOrangeBarCount) {
              return `{triangle|▲}\n{labelText|High target}\n{priceValue|${lowerMarginValue !== undefined ? fNum('tokenRatio', lowerMarginValue) : 'N/A'}}`
            }

            if (showMinMaxValues && index === totalBars - baseGreyBarCount) {
              return `{${isMobile ? 'triangleMobile' : 'triangle'}|▲}\n{${isMobile ? 'labelTextMobile' : 'labelText'}|Max price}\n{${isMobile ? 'priceValueMobile' : 'priceValue'}|${maxPriceValue !== undefined ? fNum('tokenRatio', maxPriceValue) : 'N/A'}}`
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
              padding: [showMinMaxValues && !showTargetValues ? 0 : 110, 10, 0, 0],
            },
          },
        },
        name: `Price: ${tokens}`,
        nameLocation: 'end',
        nameGap: 5,
        nameTextStyle: {
          align: 'right',
          verticalAlign: 'bottom',
          padding:
            showMinMaxValues && !showTargetValues ? [0, 30, -85, 0] : dynamicXAxisNamePadding,
          color: secondaryFontColor,
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
                  formatter: `{labelText|Current price}\n{priceValue|${currentPriceValue !== undefined ? fNum('tokenRatio', currentPriceValue) : 'N/A'}}\n{triangle|▼}`,
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

  const outOfRangeText =
    'The price has moved outside the range, so Liquidity Providers are not currently earning swap fees. The reCLAMM pool is automatically readjusting to center liquidity around the current price to maximize swap fees. '

  const inRangeReadjustingText =
    'The price is outside the target range but within the margin, so Liquidity Providers still earn swap fees. The reCLAMM pool is automatically readjusting to center liquidity around the current price to maximize swap fees.'

  const inRangeText =
    'The current price is between the target range for this Readjusting Concentrated Liquidity AMM (reCLAMM) pool. In range pools earn high swap fees.'

  return {
    options,
    hasChartData: !!currentChartData,
    isLoading: reclAmmData.isLoading,
    isPoolWithinTargetRange: !!reclAmmData.isPoolWithinTargetRange,
    toggleIsReversed,
    outOfRangeText,
    inRangeText,
    inRangeReadjustingText,
    isPoolWithinRange: currentChartData.isPoolWithinRange,
  }
}

export function ReclAmmChartProvider({ children }: PropsWithChildren) {
  const hook = useReclAmmChartLogic()
  return <ReclAmmChartContext.Provider value={hook}>{children}</ReclAmmChartContext.Provider>
}

export const useReclAmmChart = (): ReclAmmChartContextType =>
  useMandatoryContext(ReclAmmChartContext, 'ReclAmmChart')
