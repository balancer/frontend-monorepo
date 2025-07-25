import { ColorMode, theme as defaultTheme, useTheme as useChakraTheme } from '@chakra-ui/react'
import { addHours, differenceInDays, format } from 'date-fns'
import {
  GetPoolSnapshotsDocument,
  GqlPoolSnapshotDataRange,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@apollo/client'
import { createContext, PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { usePool } from '../../../PoolProvider'
import { NumberFormatter } from '@repo/lib/shared/utils/numbers'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useTheme as useNextTheme } from 'next-themes'
import { isCowAmmPool } from '../../../pool.helpers'
import { PoolChartTab, usePoolChartTabs } from './PoolChartTabsProvider'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { alignUtcWithLocalDay } from '@repo/lib/shared/utils/time'

const MIN_DISPLAY_PERIOD_DAYS = 30

export type PoolChartPeriod = {
  value: GqlPoolSnapshotDataRange
  label: string
}

export const poolChartPeriods: PoolChartPeriod[] = [
  {
    value: GqlPoolSnapshotDataRange.ThirtyDays,
    label: '30d',
  },
  {
    value: GqlPoolSnapshotDataRange.NinetyDays,
    label: '90d',
  },
  {
    value: GqlPoolSnapshotDataRange.OneHundredEightyDays,
    label: '180d',
  },
  {
    value: GqlPoolSnapshotDataRange.AllTime,
    label: 'All time',
  },
]

// Define a simpler type for gradients
export type ChartColor =
  | string
  | {
      type: 'linear'
      x: number
      y: number
      x2: number
      y2: number
      colorStops: Array<{
        offset: number
        color: string
      }>
      global?: boolean
    }

export interface PoolChartTypeOptions {
  type: 'line' | 'bar'
  color: ChartColor
  hoverColor: string
  hoverBorderColor?: string
  areaStyle?: {
    color: ChartColor
  }
}

const dataRangeToDaysMap: { [key in GqlPoolSnapshotDataRange]?: number } = {
  [GqlPoolSnapshotDataRange.ThirtyDays]: 30,
  [GqlPoolSnapshotDataRange.NinetyDays]: 90,
  [GqlPoolSnapshotDataRange.OneHundredEightyDays]: 180,
}

export const getDefaultPoolChartOptions = (
  currencyFormatter: NumberFormatter,
  nextTheme: ColorMode = 'dark',
  theme: any, // TODO: type this
  options: { useTimeRange: boolean } = { useTimeRange: false }
) => {
  const toolTipTheme = {
    heading: 'font-weight: bold; color: #E5D3BE',
    container: `background: ${theme.colors.gray[800]};`,
    text: theme.colors.gray[400],
  }

  const colorMode = nextTheme === 'dark' ? '_dark' : 'default'
  return {
    grid: {
      left: '1.5%',
      right: '2.5%',
      top: '7.5%',
      bottom: '0',
      containLabel: true,
    },
    xAxis: {
      show: true,
      type: 'time',
      minorSplitLine: { show: false },
      axisTick: { show: false },
      splitNumber: 3,
      axisLabel: {
        formatter: (value: number) => {
          return format(new Date(value * 1000), 'MMM d')
        },
        color: theme.semanticTokens.colors.font.primary[colorMode],
        opacity: 0.5,
        interval: 0,
        showMaxLabel: false,
        showMinLabel: false,
      },
      axisPointer: {
        type: 'line',
        label: {
          formatter: (params: any) => {
            return format(new Date(params.value * 1000), 'MMM d')
          },
        },
      },
      axisLine: { show: false },
      splitArea: {
        show: false,
        areaStyle: {
          color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
        },
      },
    },
    yAxis: {
      show: true,
      type: 'value',
      axisLine: { show: false },
      minorSplitLine: { show: false },
      splitLine: { show: false },
      splitNumber: 3,
      axisLabel: {
        formatter: (value: number) => {
          return currencyFormatter(value)
        },
        color: theme.semanticTokens.colors.font.primary[colorMode],
        opacity: 0.5,
        interval: 'auto',
        showMaxLabel: false,
        showMinLabel: false,
      },
    },

    tooltip: {
      show: true,
      showContent: true,
      trigger: 'axis',
      confine: true,
      axisPointer: {
        animation: false,
        type: 'shadow',
        label: {
          show: false,
        },
      },
      extraCssText: `padding-right:2rem;border: none;${toolTipTheme.container}`,
      formatter: (params: any) => {
        const data = Array.isArray(params) ? params[0] : params
        const date = new Date(data.value[0] * 1000)
        const formattedDate = format(date, 'MMM d')
        const dateWithOneHourAdded = addHours(date, 1)
        const formattedDateWithTimeRange = `${format(date, 'MMM d haaa')}-${format(dateWithOneHourAdded, 'haaa')}`

        return `
          <div style="padding: none; display: flex; flex-direction: column; justify-content: center;${
            toolTipTheme.container
          }">
            <div style="font-size: 0.85rem; font-weight: 500; color: ${toolTipTheme.text};">
              ${options?.useTimeRange ? formattedDateWithTimeRange : formattedDate}
            </div>
            <div style="font-size: 14px; font-weight: 500; color: ${toolTipTheme.text};">
              ${currencyFormatter(data.value[1])}
            </div>
          </div>
        `
      },
    },
  }
}

export function usePoolSnapshots(
  poolId: string,
  chainId: GqlChain,
  range: GqlPoolSnapshotDataRange = GqlPoolSnapshotDataRange.ThirtyDays
) {
  return useQuery(GetPoolSnapshotsDocument, {
    variables: {
      poolId: poolId.toLowerCase(),
      range,
      chainId,
    },
    notifyOnNetworkStatusChange: true,
  })
}

type PoolChartsContextType = ReturnType<typeof usePoolChartsLogic>

const PoolChartsContext = createContext<PoolChartsContextType | null>(null)

export function usePoolChartsLogic() {
  const { pool, tvl } = usePool()
  const { id: poolId } = useParams()
  const { toCurrency } = useCurrency()
  const { theme: nextTheme } = useNextTheme()
  const theme = useChakraTheme()
  const [chartValue, setChartValue] = useState(0)
  const [chartDate, setChartDate] = useState('')
  const [activePeriod, setActivePeriod] = useState(poolChartPeriods[0])
  const { activeTab } = usePoolChartTabs()

  const { data, loading: isLoading } = usePoolSnapshots(
    poolId as string,
    pool.chain,
    activePeriod.value
  )

  const isCowPool = isCowAmmPool(pool.type)

  const chartValueSum = useMemo(() => {
    if (!data?.snapshots) return null

    let val = 0

    if (activeTab.value === PoolChartTab.TVL) {
      val = Number(tvl)
    }

    if (activeTab.value === PoolChartTab.FEES) {
      val = data?.snapshots.reduce((acc, snapshot) => {
        return (acc += Number(snapshot.fees24h))
      }, 0)
    }

    if (activeTab.value === PoolChartTab.SURPLUS) {
      val = data?.snapshots.reduce((acc, snapshot) => {
        return (acc += Number(snapshot.surplus24h))
      }, 0)
    }

    if (activeTab.value === PoolChartTab.VOLUME) {
      val = data?.snapshots.reduce((acc, snapshot) => {
        return (acc += Number(snapshot.volume24h))
      }, 0)
    }

    return toCurrency(val, { abbreviated: false })
  }, [data?.snapshots, activeTab, toCurrency, tvl])

  const chartData = useMemo(() => {
    const snapshots = data?.snapshots
    if (!snapshots) return []

    let chartArr: [number, string][] = []
    if (activeTab.value === PoolChartTab.TVL) {
      chartArr = snapshots.map(snapshot => {
        return [snapshot.timestamp, snapshot.totalLiquidity]
      })
    }

    if (activeTab.value === PoolChartTab.FEES) {
      chartArr = snapshots.map(snapshot => {
        return [snapshot.timestamp, snapshot.fees24h]
      })
    }

    if (activeTab.value === PoolChartTab.SURPLUS) {
      chartArr = snapshots.map(snapshot => {
        return [snapshot.timestamp, snapshot.surplus24h]
      })
    }

    if (activeTab.value === PoolChartTab.VOLUME) {
      chartArr = snapshots.map(snapshot => {
        return [snapshot.timestamp, snapshot.volume24h]
      })
    }

    // Sort the data by timestamp
    chartArr.sort((a, b) => a[0] - b[0])

    return chartArr
  }, [data?.snapshots, activeTab])

  const processedChartData = useMemo(() => {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const firstChartDataEl = chartData[0]
    const processedElements: [number, string][] = []
    const isSelectedTabTVL = activeTab.value === PoolChartTab.TVL

    const minDataDate = firstChartDataEl ? Number(firstChartDataEl[0]) * 1000 : today.getTime()
    const daysSinceMinDataDate = differenceInDays(today, new Date(minDataDate))
    const initialTotalLiquidity = isSelectedTabTVL
      ? firstChartDataEl
        ? firstChartDataEl[1]
        : pool.dynamicData.totalLiquidity
      : undefined

    const iterateTo =
      activePeriod.value in dataRangeToDaysMap
        ? dataRangeToDaysMap[activePeriod.value]
        : daysSinceMinDataDate > MIN_DISPLAY_PERIOD_DAYS
          ? daysSinceMinDataDate
          : MIN_DISPLAY_PERIOD_DAYS

    if (iterateTo === undefined) {
      throw new Error("DataRangeToDaysMap doesn't have a value for the selected period")
    }

    for (let i = 0; i < iterateTo; i++) {
      const currentDay = new Date(today)
      currentDay.setUTCDate(today.getUTCDate() - i)
      const timestamp = currentDay.getTime() / 1000

      // If the active tab is TVL, we check if there is enough data to display
      // and if not, add current TVL to the last item
      // and fill start of the selected range with initialTotalLiquidity
      if (activeTab.value === PoolChartTab.TVL) {
        if (i === 0) {
          const existingEntry = chartData.find(item => item[0] === timestamp)

          if (existingEntry) {
            processedElements.push(existingEntry)
          } else {
            processedElements.push([timestamp, pool.dynamicData.totalLiquidity])
          }
        } else if (i === iterateTo - 1) {
          const existingEntry = chartData.find(item => item[0] === timestamp)

          if (existingEntry) {
            processedElements.push(existingEntry)
          } else {
            const isEarlierThanCreation = pool.createTime > timestamp

            if (initialTotalLiquidity === undefined) {
              throw new Error('Initial total liquidity should be defined')
            }

            processedElements.push([timestamp, isEarlierThanCreation ? '0' : initialTotalLiquidity])
          }
        } else {
          const existingEntry = chartData.find(item => item[0] === timestamp)

          if (existingEntry) {
            processedElements.push(existingEntry)
          }
        }

        continue
      }

      // If the active tab is not TVL, we check if there is enough data to display
      // for each day and if not, add 0 to days without data
      const existingEntry = chartData.find(item => item[0] === timestamp)

      if (existingEntry) {
        processedElements.push(existingEntry)
      } else {
        processedElements.push([timestamp, '0'])
      }
    }

    // timestamps from chartData are UTC midnight, but echarts interprets timestamp using local timezone
    // so we adjust by offset to display correct day on chart
    return processedElements.map(([timestamp, value]) => [alignUtcWithLocalDay(timestamp), value])
  }, [
    activePeriod.value,
    activeTab.value,
    chartData,
    pool.createTime,
    pool.dynamicData.totalLiquidity,
  ])

  const defaultChartOptions = getDefaultPoolChartOptions(toCurrency, nextTheme as ColorMode, theme)

  type SupportedPoolChartTab =
    | PoolChartTab.VOLUME
    | PoolChartTab.TVL
    | PoolChartTab.FEES
    | PoolChartTab.SURPLUS

  const poolChartTypeOptions: Record<SupportedPoolChartTab, PoolChartTypeOptions> = {
    [PoolChartTab.VOLUME]: {
      type: 'bar',
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: isCowPool
              ? theme.semanticTokens.colors.chart.pool.bar.volume.cow.from
              : theme.semanticTokens.colors.chart.pool.bar.volume.from,
          },
          {
            offset: 1,
            color: isCowPool
              ? theme.semanticTokens.colors.chart.pool.bar.volume.cow.to
              : theme.semanticTokens.colors.chart.pool.bar.volume.to,
          },
        ],
      },
      hoverColor: isCowPool
        ? theme.semanticTokens.colors.chart.pool.bar.volume.cow.hover
        : defaultTheme.colors.pink[500],
    },
    [PoolChartTab.TVL]: {
      type: 'line',
      color: defaultTheme.colors.blue[600],
      hoverBorderColor: defaultTheme.colors.pink[500],
      hoverColor: defaultTheme.colors.gray[900],
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
              color: 'rgba(14, 165, 233, 0.08)',
            },
            {
              offset: 1,
              color: 'rgba(68, 9, 236, 0)',
            },
          ],
        },
      },
    },
    [PoolChartTab.FEES]: {
      type: 'bar',
      color: defaultTheme.colors.yellow[400],
      hoverColor: defaultTheme.colors.pink[500],
    },
    [PoolChartTab.SURPLUS]: {
      type: 'bar',
      color: defaultTheme.colors.yellow[400],
      hoverColor: defaultTheme.colors.pink[500],
    },
  }

  const options = useMemo(() => {
    const activeTabOptions = poolChartTypeOptions[activeTab.value as SupportedPoolChartTab] || {
      type: 'line',
      color: defaultTheme.colors.blue[500],
      hoverColor: defaultTheme.colors.pink[500],
    }

    return {
      ...defaultChartOptions,
      series: [
        {
          type: activeTabOptions.type,
          data: processedChartData,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: activeTabOptions.color,
            borderRadius: 100,
          },
          emphasis: {
            itemStyle: {
              color: activeTabOptions.hoverColor,
              borderColor: activeTabOptions.hoverBorderColor,
            },
          },
          areaStyle: activeTabOptions.areaStyle,
          animationEasing: function (k: number) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
          },
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab.value, defaultChartOptions, processedChartData])

  const handleAxisMoved = useCallback(
    ({ dataIndex }: { dataIndex: number }) => {
      const chartHoverValue = chartData?.[dataIndex]?.[1]
      const chartHoverDate = chartData?.[dataIndex]?.[0]
      if (!chartHoverValue || !chartHoverDate) return

      setChartValue(Number(chartHoverValue))
      setChartDate(format(new Date(Number(chartHoverDate) * 1000), 'dd MMM yyyy'))
    },
    [chartData]
  )

  return {
    isLoading,
    activePeriod,
    setActivePeriod,
    chartValue,
    chartDate,
    options,
    handleAxisMoved,
    chartData,
    chartValueSum,
    hasChartData: !!chartData.length,
  }
}

export function PoolChartsProvider({ children }: PropsWithChildren) {
  const hook = usePoolChartsLogic()
  return <PoolChartsContext.Provider value={hook}>{children}</PoolChartsContext.Provider>
}

export const usePoolCharts = (): PoolChartsContextType =>
  useMandatoryContext(PoolChartsContext, 'PoolCharts')
