/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { bn, fNum, invert } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin, computeCenteredness } from './reclAmmMath'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useSelectColor } from '@repo/lib/shared/hooks/useSelectColor'
import { getPoolActionableTokens } from '@repo/lib/modules/pool/pool-tokens.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useColorMode } from '@chakra-ui/react'

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

const DEFAULT_PRICE_RATE = '1'

export function useReclAmmChartLogic() {
  const { isMobile } = useBreakpoints()
  const reclAmmData = useGetComputeReclAmmData()
  const [isReversed, setIsReversed] = useState(false)
  const [chartInstance, setChartInstance] = useState<any>(null)
  const selectColor = useSelectColor()
  const { pool } = usePool()
  const { colorMode } = useColorMode()

  const secondaryFontColor = selectColor('font', 'secondary')
  const highlightFontColor = selectColor('font', 'highlight')
  const warningFontColor = selectColor('font', 'warning')
  const borderColor = selectColor('background', 'level0')

  function toggleIsReversed() {
    setIsReversed(!isReversed)
  }

  const tokens = useMemo(() => {
    const poolTokens = getPoolActionableTokens(pool).map(token => token.symbol)

    return isReversed ? poolTokens.reverse().join(' / ') : poolTokens.join(' / ')
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

    // only scale back if token has rate but not an erc4626
    const tokenA = pool.poolTokens[0]
    const tokenB = pool.poolTokens[1]
    const tokenAHasRate = tokenA.priceRate !== DEFAULT_PRICE_RATE
    const tokenBHasRate = tokenB.priceRate !== DEFAULT_PRICE_RATE
    const shouldScaleBackTokenA = tokenAHasRate && !tokenA.isErc4626
    const shouldScaleBackTokenB = tokenBHasRate && !tokenB.isErc4626
    const shouldScaleBackPrices = shouldScaleBackTokenA || shouldScaleBackTokenB

    if (shouldScaleBackPrices) {
      // to scale back we use price * tokenARate / tokenBRate
      const tokenARate = shouldScaleBackTokenA ? tokenA.priceRate : DEFAULT_PRICE_RATE
      const tokenBRate = shouldScaleBackTokenB ? tokenB.priceRate : DEFAULT_PRICE_RATE
      const rateProviderScaleBackFactor = bn(tokenARate).div(tokenBRate)

      minPriceValue = rateProviderScaleBackFactor.times(minPriceValue).toNumber()
      maxPriceValue = rateProviderScaleBackFactor.times(maxPriceValue).toNumber()
      lowerMarginValue = rateProviderScaleBackFactor.times(lowerMarginValue).toNumber()
      upperMarginValue = rateProviderScaleBackFactor.times(upperMarginValue).toNumber()
      currentPriceValue = rateProviderScaleBackFactor.times(currentPriceValue).toNumber()
    }

    if (isReversed) {
      // Swap min/max and lower/upper
      minPriceValue = invert(maxPriceValue)
      maxPriceValue = invert(minPriceValue)
      lowerMarginValue = invert(upperMarginValue)
      upperMarginValue = invert(lowerMarginValue)
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
    const gridBottomDesktop = baseOrangeBarCount % 2 === 0 ? '19.5%' : '1%'
    const gridBottomMobile =
      baseOrangeBarCount % 2 === 0 && !(showMinMaxValues && !showTargetValues) ? '24.5%' : '16%'

    const isDarkMode = colorMode === 'dark'

    const baseGreyBarConfig = {
      count: baseGreyBarCount,
      value: isMobile ? 1 : 3,
      gradientColors: isDarkMode
        ? ['rgba(160, 174, 192, 0.5)', 'rgba(160, 174, 192, 0.1)']
        : ['rgba(160, 174, 192, 1)', 'rgba(160, 174, 192, 0.5)'],
      borderRadius: 20,
      segmentType: 'grey',
    }

    const baseOrangeBarConfig = {
      count: baseOrangeBarCount,
      value: 100,
      gradientColors: isDarkMode
        ? ['rgb(253, 186, 116)', 'rgba(151, 111, 69, 0.5)']
        : ['rgba(250, 144, 71, 1)', 'rgba(250, 144, 71, 0.5)'],
      borderRadius: 20,
      segmentType: 'orange',
    }

    const greenBarConfig = {
      name: 'Green',
      count: baseGreenBarCount,
      value: 100,
      gradientColors: isDarkMode
        ? ['rgb(99, 242, 190)', 'rgba(57, 140, 110, 0.5)']
        : ['rgba(0, 184, 130, 1)', 'rgba(0, 184, 130, 0.5)'],
      borderRadius: 20,
      segmentType: 'green',
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

      // Create series data for this segment
      const segmentSeriesData = Array(segment.count)
        .fill(null)
        .map((_, i) => {
          const isCurrentPriceBar = segmentStartIndex + i === currentPriceBarIndex

          // Define special bar styles based on position in segment
          const isFirstInSegment = i === 0
          const isLastInSegment = i === segment.count - 1
          const isMiddleInSegment = !isFirstInSegment && !isLastInSegment

          // All bars have full border radius by default
          const barBorderRadius = segment.borderRadius

          return {
            value: segment.value,
            itemStyle: {
              color: isCurrentPriceBar
                ? isPriceAdjusting
                  ? warningFontColor
                  : highlightFontColor
                : getGradientColor(segment.gradientColors),
              borderRadius: barBorderRadius,
              borderColor,
              borderWidth: 0.5,
            },
            // Store segment info for hover effects
            segmentType: segment.segmentType,
            segmentStartIndex,
            segmentEndIndex: segmentStartIndex + segment.count - 1,
            barIndex: segmentStartIndex + i,
            isFirstInSegment,
            isLastInSegment,
            isMiddleInSegment,
            // Define hover state styling
            emphasis: {
              itemStyle: {
                borderColor,
                borderWidth: 0.5,
                color: isCurrentPriceBar
                  ? isPriceAdjusting
                    ? warningFontColor
                    : highlightFontColor
                  : getGradientColor(segment.gradientColors),
              },
            },
          }
        })

      seriesData.push(...segmentSeriesData)
    })

    const baseRichProps = {
      fontSize: 12,
      lineHeight: 13,
      color: secondaryFontColor,
      align: 'center',
    }

    const paddingRight = isMobile ? 5 : 10

    const richStyles = {
      base: baseRichProps,
      triangle: {
        ...baseRichProps,
        fontSize: 9,
        lineHeight: 12,
        color: '#718096',
      },
      current: {
        ...baseRichProps,
        color: isPriceAdjusting ? warningFontColor : highlightFontColor,
      },
      currentTriangle: {
        ...baseRichProps,
        fontSize: 8,
        lineHeight: 14,
        color: isPriceAdjusting ? warningFontColor : highlightFontColor,
      },
      withRightPadding: {
        ...baseRichProps,
        padding: [0, paddingRight, 0, 0],
      },
      withRightBottomPadding: {
        ...baseRichProps,
        padding: [0, paddingRight, 5, 0],
      },
      withTopRightPadding: {
        ...baseRichProps,
        padding: [showMinMaxValues && !showTargetValues ? 0 : 100, paddingRight, 0, 0],
      },
    }

    return {
      tooltip: {
        show: true,
        trigger: 'item',
        formatter: (params: any) => {
          const { data } = params
          // data.segmentType: 'orange', 'green', 'grey'
          // data.segmentStartIndex, data.segmentEndIndex
          if (data.segmentType === 'orange') {
            // Determine if left or right orange by index
            return `The ${data.segmentStartIndex < baseGreyBarCount + baseOrangeBarCount ? 'lower' : 'upper'} margin is part of the uniform concentrated liquidity of the pool. When the current price is within this range, swaps continue to route through the pool and LPs earn swap fees. Also, the pool will begin to automatically readjust and recenter the concentrated liquidity around the current price.`
          }
          if (data.segmentType === 'green') {
            return 'This is part of the uniform concentrated liquidity of the pool. When the current price is anywhere within this range, swaps route through the pool and LPs earn swap fees that are likely to be higher compared to an otherwise equivalent weighted pool.'
          }
          if (data.segmentType === 'grey') {
            // Determine if left or right grey by index
            return `When the current price is ${data.segmentStartIndex < baseGreyBarCount ? 'below the minimum' : 'above the maximum'} price of the concentrated liquidity range, swaps will not route through the pool and LPs will not earn fees. The pool will automatically readjust ${data.segmentStartIndex < baseGreyBarCount ? 'downwards' : 'upwards'} to recenter the concentrated liquidity around the current price.`
          }
          return ''
        },
        backgroundColor: '#222',
        textStyle: { color: '#fff', fontSize: 12 },
        borderWidth: 0,
        borderRadius: 4,
        padding: 6,
        extraCssText:
          'max-width:222px; white-space:pre-line; word-break:break-word; word-wrap:break-word; line-height:1.3;',
      },
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
              fontSize: 9,
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
          barWidth: '100%',
          barGap: '0',
          animation: false,
          silent: false, // Enable interactions for hover effects
          emphasis: {
            focus: 'series', // Focus the entire series when hovering
            scale: false, // Disable default scaling behavior
          },
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

  // Apply hover effects when chart instance is available and chart data is ready
  useEffect(() => {
    if (!chartInstance || !options.series || !options.series[0] || !options.series[0].data) return

    // No need for segments config as we're handling border radius dynamically

    // Extract series data from options
    const seriesData = options.series[0].data || []

    // Track current active segment to prevent flickering
    let activeSegment: { segmentType: string; startIndex: number; endIndex: number } | null = null
    let hoverTimer: number | null = null

    // Pre-compute all the possible segment states for better performance
    // This avoids recalculating during mouse events
    const segmentStates: Record<string, any[]> = {}

    seriesData.forEach((bar: any) => {
      if (bar && bar.segmentType && ['green', 'orange', 'grey'].includes(bar.segmentType)) {
        const segmentKey = `${bar.segmentType}-${bar.segmentStartIndex}-${bar.segmentEndIndex}`

        if (!segmentStates[segmentKey]) {
          const segmentBars: any[] = Array(bar.segmentEndIndex - bar.segmentStartIndex + 1)

          for (let i = bar.segmentStartIndex; i <= bar.segmentEndIndex; i++) {
            const isMiddleBar = i !== bar.segmentStartIndex && i !== bar.segmentEndIndex
            const isFirstInSegment = i === bar.segmentStartIndex
            const isLastInSegment = i === bar.segmentEndIndex
            const isSingleBar = bar.segmentStartIndex === bar.segmentEndIndex

            // Store hover border radius based on position (applied only during hover)
            let hoverBorderRadius: number | number[] = 0
            if (isSingleBar) hoverBorderRadius = 20
            else if (isFirstInSegment) hoverBorderRadius = [20, 0, 0, 20] as number[]
            else if (isLastInSegment) hoverBorderRadius = [0, 20, 20, 0] as number[]

            segmentBars[i - bar.segmentStartIndex] = {
              itemStyle: {
                // Don't set borderRadius here - just store it for hover state
                hoverBorderRadius, // Store the hover border radius but don't apply it yet
                opacity: 1,
              },
              // Increase width for better overlap between bars - prevents flickering by ensuring bars touch
              barWidth: isMiddleBar ? '120%' : '110%',
            }
          }
          segmentStates[segmentKey] = segmentBars
        }
      }
    })

    // Apply hover effect to a specific segment
    const applyHoverEffect = (
      segmentType: string,
      segmentStartIndex: number,
      segmentEndIndex: number
    ) => {
      // Clear any pending timer
      if (hoverTimer !== null) {
        window.clearTimeout(hoverTimer)
        hoverTimer = null
      }

      // Update active segment tracking
      activeSegment = {
        segmentType,
        startIndex: segmentStartIndex,
        endIndex: segmentEndIndex,
      }

      // Prepare a single update with all changes at once
      const updatedSeriesData = chartInstance
        .getOption()
        .series[0].data.map((d: any, idx: number) => {
          // Default: dim all bars to opacity 0.5
          let update = {
            ...d,
            itemStyle: {
              ...d.itemStyle,
              opacity: 0.5,
            },
          }

          // For bars in the hovered segment, apply the pre-computed state
          if (idx >= segmentStartIndex && idx <= segmentEndIndex) {
            const segmentKey = `${segmentType}-${segmentStartIndex}-${segmentEndIndex}`
            const relativeIdx = idx - segmentStartIndex
            const segmentStyle = segmentStates[segmentKey]?.[relativeIdx]

            if (segmentStyle) {
              update = {
                ...d,
                itemStyle: {
                  ...d.itemStyle,
                  // Apply the hover border radius only during hover
                  borderRadius: segmentStyle.itemStyle.hoverBorderRadius,
                  opacity: segmentStyle.itemStyle.opacity,
                },
                barWidth: segmentStyle.barWidth,
              }
            }
          }

          return update
        })

      // Make a single setOption call with all changes
      chartInstance.setOption(
        {
          series: [
            {
              data: updatedSeriesData,
            },
          ],
        },
        false
      )

      // Highlight the hovered segment in a single dispatch
      for (let i = segmentStartIndex; i <= segmentEndIndex; i++) {
        chartInstance.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: i,
        })
      }
    }

    // Reset all hover effects
    const resetHoverEffect = () => {
      activeSegment = null

      // Reset all bars to original state in a single update
      const resetData = chartInstance.getOption().series[0].data.map((d: any, i: number) => {
        const item = seriesData[i] as any
        if (!item) return d

        // Always restore full border radius when not hovering
        const borderRadius = 20

        return {
          ...d,
          itemStyle: {
            ...d.itemStyle,
            borderRadius,
            opacity: 1,
          },
          barWidth: '90%',
        }
      })

      // Single setOption call to reset everything
      chartInstance.setOption(
        {
          series: [
            {
              data: resetData,
            },
          ],
        },
        false
      )

      // Single downplay action
      chartInstance.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
      })
    }

    // Setup event handlers for hover effects
    const mouseoverHandler = (params: any) => {
      if (!params || params.dataIndex === undefined) return

      const barIndex = params.dataIndex
      const barItem = seriesData[barIndex] as any
      if (!barItem) return

      // Only apply effects to bars within the same segment
      const { segmentType, segmentStartIndex, segmentEndIndex } = barItem

      // Apply gooey effect to green, orange, and grey segments
      if (!['green', 'orange', 'grey'].includes(segmentType)) return

      // Clear any pending reset timer
      if (hoverTimer !== null) {
        window.clearTimeout(hoverTimer)
        hoverTimer = null
      }

      // Check if we're already hovering this segment
      if (
        activeSegment &&
        activeSegment.segmentType === segmentType &&
        activeSegment.startIndex === segmentStartIndex &&
        activeSegment.endIndex === segmentEndIndex
      ) {
        // Already hovering this segment, no need to reapply
        return
      }

      // Apply hover effect to the new segment
      applyHoverEffect(segmentType, segmentStartIndex, segmentEndIndex)
    }

    // Handler for mouse leaving a bar - use small delay to prevent flickering
    const mouseoutHandler = () => {
      // Don't reset immediately - set a small delay to allow moving between bars
      // without flickering
      if (hoverTimer !== null) {
        window.clearTimeout(hoverTimer)
      }

      hoverTimer = window.setTimeout(() => {
        resetHoverEffect()
        hoverTimer = null
      }, 50) // Small delay to allow mouse to move between bars
    }

    // Handler for mouse leaving the entire chart area - immediate reset
    const chartMouseoutHandler = () => {
      if (hoverTimer !== null) {
        window.clearTimeout(hoverTimer)
        hoverTimer = null
      }
      resetHoverEffect()
    }

    // Register events on chart
    chartInstance.on('mouseover', 'series.bar', mouseoverHandler)
    chartInstance.on('mouseout', 'series.bar', mouseoutHandler)
    chartInstance.on('globalout', chartMouseoutHandler)

    // Cleanup event handlers on unmount
    return () => {
      if (chartInstance) {
        chartInstance.off('mouseover', 'series.bar', mouseoverHandler)
        chartInstance.off('mouseout', 'series.bar', mouseoutHandler)
        chartInstance.off('globalout', chartMouseoutHandler)
      }
    }
  }, [chartInstance, options])

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
    tokens,
    setChartInstance,
  }
}

export function ReclAmmChartProvider({ children }: PropsWithChildren) {
  const hook = useReclAmmChartLogic()
  return <ReclAmmChartContext.Provider value={hook}>{children}</ReclAmmChartContext.Provider>
}

export const useReclAmmChart = (): ReclAmmChartContextType =>
  useMandatoryContext(ReclAmmChartContext, 'ReclAmmChart')
