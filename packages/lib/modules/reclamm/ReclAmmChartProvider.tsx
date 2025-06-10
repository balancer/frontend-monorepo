/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, PropsWithChildren, useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin } from './reclAmmMath'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

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
  const { toCurrency } = useCurrency()
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

    //const maxPrice = formatUnits(reclAmmData.priceRange[0], 18)
    //const minPrice = formatUnits(reclAmmData.priceRange[1], 18)
    //const priceRatio = bn(maxPrice).div(minPrice)

    const margin = formatUnits(reclAmmData.centerednessMargin, 16)

    const virtualBalanceA = formatUnits(reclAmmData.virtualBalances.virtualBalanceA, 18)
    const virtualBalanceB = formatUnits(reclAmmData.virtualBalances.virtualBalanceB, 18)

    const invariant = bn(bn(balanceA).plus(virtualBalanceA)).times(
      bn(balanceB).plus(virtualBalanceB)
    )

    // Mathematical function for the curve: y = invariant / x
    const curveFunction = (x: number): number => {
      return invariant.div(bn(x)).toNumber()
    }

    const xForPointB = bn(invariant).div(virtualBalanceB)

    const curvePoints = Array.from({ length: 100 }, (_, i) => {
      const x = bn(0.7)
        .times(virtualBalanceA)
        .plus(
          bn(i)
            .times(bn(1.3).times(xForPointB).minus(bn(0.7).times(virtualBalanceA)))
            .div(bn(100))
        )
      const y = curveFunction(x.toNumber())

      return [x.toNumber(), y]
    })

    const vBalanceA = Number(virtualBalanceA)
    const vBalanceB = Number(virtualBalanceB)
    const xForMinPrice = bn(invariant).div(virtualBalanceB).toNumber()

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

    // const currentBalance = bn(balanceA).plus(virtualBalanceA).toNumber()

    const minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber()
    const maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber()

    const lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()
    const upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()

    const currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    return {
      series: curvePoints,
      min: xForMinPrice,
      max: vBalanceA,
      lowerMargin,
      upperMargin,
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
      value: 3,
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

    barSegmentsConfig.forEach(segment => {
      const segmentCategories: string[] = []

      for (let i = 0; i < segment.count; i++) {
        segmentCategories.push(String(categoryNumber++))
      }

      allCategories.push(...segmentCategories)

      const segmentSeriesData = Array(segment.count)
        .fill(null)
        .map(() => ({
          value: segment.value,
          itemStyle: {
            color: getGradientColor(segment.gradientColors),
            borderRadius: segment.borderRadius,
          },
        }))

      seriesData.push(...segmentSeriesData)
    })

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

      // Calculate price range per bar (58 bars in the colored section)
      const priceRange = maxPriceValue - minPriceValue
      const pricePerBar = priceRange / 58 // 58 bars in the colored section (8 orange + 42 green + 8 orange)

      // Calculate how many bars from the start of the colored section (after 10 grey bars)
      const barsFromMin = (currentPriceValue - minPriceValue) / pricePerBar

      // Add the initial 10 grey bars and round down to nearest bar
      const barIndex = Math.min(Math.max(0, Math.floor(barsFromMin)), 57) + 10

      return barIndex
    }

    const currentPriceBarIndex = getCurrentPriceBarIndex()

    // Calculate position as a percentage (0-100%)
    const getBarPosition = (barIndex: number): string => {
      // Each bar takes up 1.15% of the width (90% bar + 25% gap)
      // Start at 0% + half bar width (0.45%)
      const position = barIndex * 1.15 + 0.5
      return `${position.toFixed(2)}%`
    }

    const graphicStyleProps = {
      textAlign: 'center',
      fill: '#A0AEC0',
      rich: {
        triangle: { fontSize: 10, lineHeight: 12 },
        labelText: { fontSize: 12, lineHeight: 13 },
        priceValue: { fontSize: 12, lineHeight: 13, align: 'center' },
      },
    }

    return {
      tooltip: { show: false },
      grid: {
        left: '-3%',
        right: '1%',
        top: '15%',
        bottom: '8%',
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
          formatter: () => '',
          color: '#666',
          fontSize: 12,
        },
      },
      yAxis: {
        show: false,
        type: 'value',
      },
      series: [
        {
          data: seriesData,
          type: 'bar',
          barWidth: '90%',
          barCategoryGap: '25%',
          silent: true,
        },
      ],
      graphic: [
        {
          type: 'text',
          left: getBarPosition(currentPriceBarIndex),
          top: '5%',
          style: {
            text: `{labelText|Current price}\n{priceValue|${currentPriceValue !== undefined ? toCurrency(currentPriceValue, { abbreviated: false }) : 'N/A'}}\n{triangle|▼}`,
            ...graphicStyleProps,
            fill: '#63F2BE', // this overwrite is intentional
          },
          silent: true,
        },
        {
          type: 'text',
          silent: true,
          left: getBarPosition(8),
          bottom: 0,
          style: {
            text: `{triangle|▲}\n{labelText|Min price}\n{priceValue|${minPriceValue !== undefined ? toCurrency(minPriceValue, { abbreviated: false }) : 'N/A'}}`,
            ...graphicStyleProps,
          },
        },
        {
          type: 'text',
          silent: true,
          left: getBarPosition(17),
          bottom: 0,
          style: {
            text: `{triangle|▲}\n{labelText|Low target}\n{priceValue|${upperMarginValue !== undefined ? toCurrency(upperMarginValue, { abbreviated: false }) : 'N/A'}}`,
            ...graphicStyleProps,
          },
        },
        // {
        //   type: 'text',
        //   silent: true,
        //   left: '47.1%',
        //   bottom: 0,
        //   style: {
        //     text: `{triangle|▲}\n{labelText|Center}`,
        //     ...graphicStyleProps,
        //   },
        // },
        {
          type: 'text',
          silent: true,
          left: getBarPosition(63),
          bottom: 0,
          style: {
            text: `{triangle|▲}\n{labelText|High target}\n{priceValue|${lowerMarginValue !== undefined ? toCurrency(lowerMarginValue, { abbreviated: false }) : 'N/A'}}`,
            ...graphicStyleProps,
          },
        },
        {
          type: 'text',
          silent: true,
          left: getBarPosition(72),
          bottom: 0,
          style: {
            text: `{triangle|▲}\n{labelText|Max price}\n{priceValue|${maxPriceValue !== undefined ? toCurrency(maxPriceValue, { abbreviated: false }) : 'N/A'}}`,
            ...graphicStyleProps,
          },
        },
      ],
    }
  }, [currentChartData])

  return {
    option,
    hasChartData: !!currentChartData.series?.length,
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
