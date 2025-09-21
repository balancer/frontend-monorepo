import { useMemo } from 'react'
import {
  calculateLowerMargin,
  calculateUpperMargin,
  computeCenteredness,
} from '@repo/lib/modules/reclamm/reclAmmMath'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useColorMode } from '@chakra-ui/react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { useSelectColor } from '@repo/lib/shared/hooks/useSelectColor'

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

// const DEFAULT_PRICE_RATE = '1' // TODO

type UseReclAmmChartParams = {
  balanceA: number
  balanceB: number
  virtualBalanceA: number
  virtualBalanceB: number
  margin: number
  isPriceAdjusting: boolean
  isPoolWithinTargetRange: boolean
  isReversed: boolean
}

export function useReclAmmChart({
  balanceA,
  balanceB,
  virtualBalanceA,
  virtualBalanceB,
  margin,
  isPriceAdjusting,
  isPoolWithinTargetRange,
  isReversed,
}: UseReclAmmChartParams) {
  const { isMobile } = useBreakpoints()
  const { colorMode } = useColorMode()
  const selectColor = useSelectColor()

  const secondaryFontColor = selectColor('font', 'secondary')
  const highlightFontColor = selectColor('font', 'highlight')
  const warningFontColor = selectColor('font', 'warning')
  const borderColor = selectColor('background', 'level0')

  const currentChartData = useMemo(() => {
    if (!balanceA || !balanceB || !virtualBalanceA || !virtualBalanceB || !margin) {
      return {}
    }

    const invariant = bn(bn(balanceA).plus(virtualBalanceA)).times(
      bn(balanceB).plus(virtualBalanceB)
    )

    const rBalanceA = balanceA
    const rBalanceB = balanceB
    const vBalanceA = virtualBalanceA
    const vBalanceB = virtualBalanceB
    const marginValue = margin

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

    const minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber()
    const maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber()

    const lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()
    const upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()

    const currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    // TODO: how to get .priceRate on the pool creation tokens?
    // OR should we move the whole currentChartData fn out of hook and feed the return values as params?

    // only scale back if token has rate but not an erc4626
    // const tokenA = pool.poolTokens[0]
    // const tokenB = pool.poolTokens[1]
    // const tokenAHasRate = tokenA.priceRate !== DEFAULT_PRICE_RATE
    // const tokenBHasRate = tokenB.priceRate !== DEFAULT_PRICE_RATE
    // const shouldScaleBackTokenA = tokenAHasRate && !tokenA.isErc4626
    // const shouldScaleBackTokenB = tokenBHasRate && !tokenB.isErc4626
    // const shouldScaleBackPrices = shouldScaleBackTokenA || shouldScaleBackTokenB

    // if (shouldScaleBackPrices) {
    //   // to scale back we use price * tokenARate / tokenBRate
    //   const tokenARate = shouldScaleBackTokenA ? tokenA.priceRate : DEFAULT_PRICE_RATE
    //   const tokenBRate = shouldScaleBackTokenB ? tokenB.priceRate : DEFAULT_PRICE_RATE
    //   const rateProviderScaleBackFactor = bn(tokenARate).div(tokenBRate)

    //   minPriceValue = rateProviderScaleBackFactor.times(minPriceValue).toNumber()
    //   maxPriceValue = rateProviderScaleBackFactor.times(maxPriceValue).toNumber()
    //   lowerMarginValue = rateProviderScaleBackFactor.times(lowerMarginValue).toNumber()
    //   upperMarginValue = rateProviderScaleBackFactor.times(upperMarginValue).toNumber()
    //   currentPriceValue = rateProviderScaleBackFactor.times(currentPriceValue).toNumber()
    // }

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
  }, [balanceA, balanceB, virtualBalanceA, virtualBalanceB, margin])

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

    const isLowMarginValue = marginValue && marginValue < 25
    const needsMobileStyles = isMobile || isLowMarginValue

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
      if (isPoolWithinTargetRange) {
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
        bottom: needsMobileStyles ? gridBottomMobile : gridBottomDesktop,
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
              return `{${needsMobileStyles ? 'triangleMobile' : 'triangle'}|▲}\n{${needsMobileStyles ? 'labelTextMobile' : 'labelText'}|Min price}\n{${needsMobileStyles ? 'priceValueMobile' : 'priceValue'}|${minPriceValue !== undefined ? fNum('tokenRatio', minPriceValue) : 'N/A'}}`
            }

            if (showTargetValues && index === baseGreyBarCount + baseOrangeBarCount) {
              return `{triangle|▲}\n{labelText|Low target}\n{priceValue|${upperMarginValue !== undefined ? fNum('tokenRatio', upperMarginValue) : 'N/A'}}`
            }

            if (showTargetValues && index === totalBars - baseGreyBarCount - baseOrangeBarCount) {
              return `{triangle|▲}\n{labelText|High target}\n{priceValue|${lowerMarginValue !== undefined ? fNum('tokenRatio', lowerMarginValue) : 'N/A'}}`
            }

            if (showMinMaxValues && index === totalBars - baseGreyBarCount) {
              return `{${needsMobileStyles ? 'triangleMobile' : 'triangle'}|▲}\n{${needsMobileStyles ? 'labelTextMobile' : 'labelText'}|Max price}\n{${needsMobileStyles ? 'priceValueMobile' : 'priceValue'}|${maxPriceValue !== undefined ? fNum('tokenRatio', maxPriceValue) : 'N/A'}}`
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

  const { lowerMarginValue, upperMarginValue } = currentChartData

  return { options, lowerMarginValue, upperMarginValue }
}
