/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, PropsWithChildren, useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetComputeReclAmmData } from './useGetComputeReclAmmData'
import { calculateLowerMargin, calculateUpperMargin } from './reclAmmMath'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'

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

    const currentBalance = bn(balanceA).plus(virtualBalanceA).toNumber()

    const minPriceValue = bn(virtualBalanceB).pow(2).div(invariant).toNumber()
    const maxPriceValue = bn(invariant).div(bn(virtualBalanceA).pow(2)).toNumber()

    const lowerMarginValue = bn(invariant).div(bn(lowerMargin).pow(2)).toNumber()
    const upperMarginValue = bn(invariant).div(bn(upperMargin).pow(2)).toNumber()

    const currentPriceValue = bn(bn(balanceB).plus(virtualBalanceB))
      .div(bn(balanceA).plus(virtualBalanceA))
      .toNumber()

    const markPoints = [
      { name: 'upper limit', x: vBalanceA, color: '#FF4560', priceValue: maxPriceValue },
      { name: 'lower limit', x: xForMinPrice, color: '#FF4560', priceValue: minPriceValue },
      {
        name: 'higher target',
        x: lowerMargin,
        color: '#E67E22',
        priceValue: lowerMarginValue,
      },
      {
        name: 'lower target',
        x: upperMargin,
        color: '#E67E22',
        priceValue: upperMarginValue,
      },
      {
        name: 'current',
        x: currentBalance,
        priceValue: currentPriceValue,

        color: '#00E396',
      },
    ].map(point => {
      return {
        name: point.name,
        coord: [point.x, curveFunction(point.x)],
        itemStyle: {
          color: point.color,
        },
        emphasis: {
          disabled: true,
        },
        silent: true,
        priceValue: point.priceValue,
      }
    })

    return {
      series: curvePoints,
      markPoints,
      min: xForMinPrice,
      max: vBalanceA,
      lowerMargin,
      upperMargin,
    }
  }, [reclAmmData])

  const option = useMemo(() => {
    const leftGreyBars = ['AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ']
    const rightGreyBars = ['EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG', 'EH', 'EI', 'EJ']
    const leftOrangeBars = ['BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH']
    const rightOrangeBars = ['DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH']
    const greenBars = [
      'CAA',
      'CAB',
      'CAC',
      'CAD',
      'CAE',
      'CAF',
      'CAG',
      'CAH',
      'CAI',
      'CAJ',
      'CAK',
      'CAL',
      'CAM',
      'CAN',
      'CAO',
      'CAP',
      'CAQ',
      'CAR',
      'CAS',
      'CAT',
      'CAU',
      'CAV',
      'CAW',
      'CAX',
      'CAY',
      'CAZ',
      'CBA',
      'CBB',
      'CBC',
      'CBD',
      'CBE',
      'CBF',
      'CBG',
      'CBH',
      'CBI',
      'CBJ',
      'CBK',
      'CBL',
      'CBM',
      'CBN',
      'CBO',
      'CBP',
    ]

    return {
      xAxis: {
        show: false,
        type: 'category',
        data: [
          ...leftGreyBars,
          ...leftOrangeBars,
          ...greenBars,
          ...rightOrangeBars,
          ...rightGreyBars,
        ],
      },
      yAxis: {
        show: false,
        type: 'value',
      },
      series: [
        {
          data: [
            ...Array(10)
              .fill(4)
              .map(value => ({
                value,
                itemStyle: {
                  color: getGradientColor(['rgba(160, 174, 192, 0.5)', 'rgba(160, 174, 192, 0.1)']),
                  borderRadius: 20,
                },
              })),
            ...Array(8)
              .fill(100)
              .map(value => ({
                value,
                itemStyle: {
                  color: getGradientColor(['rgb(253, 186, 116)', 'rgba(151, 111, 69, 0.5)']),
                  borderRadius: 20,
                },
              })),
            ...Array(42)
              .fill(100)
              .map(value => ({
                value,
                itemStyle: {
                  color: getGradientColor(['rgb(99, 242, 190)', 'rgba(57, 140, 110, 0.5)']),
                  borderRadius: 20,
                },
              })),
            ...Array(8)
              .fill(100)
              .map(value => ({
                value,
                itemStyle: {
                  color: getGradientColor(['rgb(253, 186, 116)', 'rgba(151, 111, 69, 0.5)']),
                  borderRadius: 20,
                },
              })),
            ...Array(10)
              .fill(4)
              .map(value => ({
                value,
                itemStyle: {
                  color: getGradientColor(['rgba(160, 174, 192, 0.5)', 'rgba(160, 174, 192, 0.1)']),
                  borderRadius: 20,
                },
              })),
          ],
          type: 'bar',
          barWidth: '90%',
          barCategoryGap: '25%', // Adds space between bars
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
