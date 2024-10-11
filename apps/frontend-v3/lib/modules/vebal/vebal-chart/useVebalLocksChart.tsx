'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useTheme as useChakraTheme } from '@chakra-ui/react'

import * as echarts from 'echarts/core'
import { EChartsOption, ECharts } from 'echarts'
import { format, differenceInDays } from 'date-fns'
import BigNumber from 'bignumber.js'
import { lockSnapshots } from './test-locks'
import { useVebalLockInfo } from '../../vebal/useVebalLockInfo'
import { bn, fNum } from '@/lib/shared/utils/numbers'
import { useTheme as useNextTheme } from 'next-themes'

type ChartValueAcc = [string, number][]

interface LockSnapshot {
  bias: string
  slope: string
  timestamp: number
}

function groupValuesByDates(chartValues: ChartValueAcc) {
  return chartValues.reduce((acc: Record<string, number[]>, item) => {
    const [date, value] = item
    if (acc[date]) {
      acc[date].push(value)
    } else {
      acc[date] = [value]
    }
    return acc
  }, {})
}

function calculatePoint2Balance(snapshot: LockSnapshot, slope: BigNumber, now: BigNumber) {
  const point2V = bn(snapshot.bias).minus(slope.times(now.minus(snapshot.timestamp)))
  return point2V.isLessThan(0) ? 0 : point2V.toNumber()
}

function formatDate(timestamp: number) {
  return format(timestamp * 1000, 'yyyy/MM/dd')
}

function processLockSnapshots(lockSnapshots: LockSnapshot[]) {
  const currentDate = (Date.now() / 1000).toFixed(0)

  return lockSnapshots.reduce((acc: ChartValueAcc, snapshot, i) => {
    const slope = bn(snapshot.slope)
    const now = lockSnapshots[i + 1] ? bn(lockSnapshots[i + 1].timestamp) : bn(currentDate)

    const point1Balance = bn(snapshot.bias).toNumber()
    const point1Date = formatDate(snapshot.timestamp)

    const point2Balance = calculatePoint2Balance(snapshot, slope, now)
    const point2Date = formatDate(now.toNumber())

    acc.push([point1Date, point1Balance])

    if (point1Balance.toFixed(2) !== point2Balance.toFixed(2)) {
      acc.push([point2Date, point2Balance])
    }

    return acc
  }, [])
}

function filterAndFlattenValues(valuesByDates: Record<string, number[]>) {
  return Object.keys(valuesByDates).reduce((acc: ChartValueAcc, item) => {
    const values = valuesByDates[item] ?? []
    const filteredValues = values.length > 2 ? [Math.min(...values), Math.max(...values)] : values

    filteredValues.forEach((val: number) => {
      acc.push([item, val])
    })
    return acc
  }, [])
}

const MAIN_SERIES_ID = 'main-series'
const FUTURE_SERIES_ID = 'future-series'

export function useVebalLocksChart() {
  const theme = useChakraTheme()
  const { theme: nextTheme } = useNextTheme()

  const instanceRef = useRef<ECharts>()

  const userHistoricalLocks = lockSnapshots

  const { mainnetLockedInfo } = useVebalLockInfo()
  const lockedUntil = mainnetLockedInfo.lockedEndDate
    ? differenceInDays(new Date(mainnetLockedInfo.lockedEndDate), new Date())
    : 0
  const hasExistingLock = mainnetLockedInfo.hasExistingLock
  const isExpired = mainnetLockedInfo.isExpired

  const chartValues = useMemo(() => {
    if (!userHistoricalLocks) return []

    const processedValues = processLockSnapshots(lockSnapshots)
    const valuesByDates = groupValuesByDates(processedValues)
    return filterAndFlattenValues(valuesByDates)
  }, [userHistoricalLocks])

  const futureLockChartData = useMemo(() => {
    if (hasExistingLock && !isExpired) {
      return {
        id: FUTURE_SERIES_ID,
        name: '',
        type: 'line' as const,
        data: [
          chartValues[chartValues.length - 1],
          [format(new Date(mainnetLockedInfo.lockedEndDate).getTime(), 'yyyy/MM/dd'), 0],
        ],
        lineStyle: {
          type: [3, 15],
          color: '#EAA879',
          width: 5,
          cap: 'round' as const,
        },
        showSymbol: false,
      }
    }
    return {
      name: '',
      type: 'line' as const,
      data: [],
    }
  }, [chartValues, mainnetLockedInfo.lockedEndDate, hasExistingLock, isExpired])

  const showStaticTooltip = useCallback(() => {
    if (!mouseoverRef.current) {
      if (instanceRef.current) {
        // Show tooltip on a specific data point when chart is loaded
        instanceRef.current.dispatchAction({
          type: 'showTip',
          seriesIndex: 0, // Index of the series
          dataIndex: chartValues.length - 1, // Index of the data point
        })
      }
    }
  }, [chartValues])

  const onChartReady = useCallback((instance: ECharts) => {
    instanceRef.current = instance
  }, [])

  // detect if "static" tooltip is showing
  const mouseoverRef = useRef<boolean | undefined>()

  useEffect(() => {
    if (instanceRef.current) {
      const handler = () => {
        mouseoverRef.current = true
      }
      const element = instanceRef.current.getDom()

      // using "addEventListener" instead of "onEvents.mouseover" since "onEvents.mouseover" emits only when cursor crosses the line, not the entire chart...
      element.addEventListener('mouseover', handler)

      return () => {
        element.removeEventListener('mouseover', handler)
      }
    }
  }, [])

  const onEvents = useMemo((): Partial<
    Record<
      echarts.ElementEvent['type'] | 'highlight' | 'finished',
      (event: echarts.ElementEvent | any, instance: ECharts) => boolean | void
    >
  > => {
    return {
      click: () => {
        mouseoverRef.current = true
      },
      globalout: () => {
        mouseoverRef.current = false
        showStaticTooltip()
      },
      finished: () => {
        showStaticTooltip()
      },
    }
  }, [showStaticTooltip])

  const options = useMemo((): EChartsOption => {
    const toolTipTheme = {
      heading: 'font-weight: bold; color: #E5D3BE',
      container: `background: ${
        nextTheme === 'dark'
          ? theme.semanticTokens.colors.background.level3._dark
          : theme.semanticTokens.colors.background.default
      };`,
      text:
        nextTheme === 'dark'
          ? theme.semanticTokens.colors.font.primary._dark
          : theme.semanticTokens.colors.font.primary.default,
    }
    return {
      grid: {
        left: '1.5%',
        right: '2.5%',
        top: '7.5%',
        bottom: '0',
        containLabel: true,
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
        extraCssText: `border: none;${toolTipTheme.container};max-width: 215px; z-index: 5`,
        position: (point, params, dom, rect, size) => {
          if (!mouseoverRef.current) {
            return [point[0] - size.contentSize[0] / 2, 0]
          }
          return [point[0] + 15, point[1] + 15]
        },
        formatter: params => {
          const firstPoint = Array.isArray(params) ? params[0] : params
          const secondPoint = Array.isArray(params) ? params[1] : null

          const firstPointValue = firstPoint.value as number[]
          const secondPointValue = secondPoint ? (secondPoint.value as number[]) : null

          if (!mouseoverRef.current) {
            if (firstPoint.seriesId === MAIN_SERIES_ID) {
              if (firstPoint.dataIndex === chartValues.length - 1) {
                return `
                <div style="padding: unset; display: flex; flex-direction: column; justify-content: center;
                  ${toolTipTheme.container}">
                  <div style="font-size: 0.85rem; font-weight: 500; white-space: normal; line-height: 20px;
                    color: ${toolTipTheme.text};">
                    Increase your lock to 1 year to maximize your veBAL to 30.346 (mocked text)
                  </div>
                </div>
              `
              }
            }
          }

          return `
          <div style="padding: unset; display: flex; flex-direction: column;
            justify-content: center; ${toolTipTheme.container}">
            <div style="font-size: 14px; font-weight: 700; display: flex; flex-wrap: wrap;
              justify-content: start; gap: 0px; letter-spacing: -0.25px; padding-bottom: 2px;
              ${toolTipTheme.heading}; color: ${toolTipTheme.text};">
              ${format(new Date(firstPointValue[0]), 'yyyy/MM/dd')}
            </div>
            <div style="display: flex; flex-direction: column; font-size: 14px;
              line-height: 20px; font-weight: 500; color: ${toolTipTheme.text};">
              ${
                secondPointValue
                  ? `
                    <span>
                      <span style="display: inline-block; margin-right: 4px; border-radius: 10px;
                        width: 10px; height: 10px; background-color: #BCA25D;">
                      </span>
                      <span>${fNum('token', secondPointValue[1])} veBAL</span>
                    </span>
                  `
                  : ''
              }
              <span>
                <span style="display: inline-block; margin-right: 4px; border-radius: 10px;
                  width: 10px; height: 10px; background-color: #BCA25D;">
                </span>
                <span>${fNum('token', firstPointValue[1])} veBAL</span>
                </span>
            </div>
          </div>
        `
        },
      },
      xAxis: {
        show: true,
        type: 'time',
        minorSplitLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          formatter: (value: number) => {
            return format(new Date(value), 'MMM d')
          },
          // color: theme.semanticTokens.colors.font.primary[colorMode],
          opacity: 0.5,
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
        axisLabel: {
          // color: theme.semanticTokens.colors.font.primary[colorMode],
          opacity: 0.5,
        },
      },
      series: [
        {
          id: MAIN_SERIES_ID,
          name: '',
          type: 'line' as const,
          data: chartValues,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(14, 165, 233, 0.08)' },
              { offset: 1, color: 'rgba(68, 9, 236, 0)' },
            ]),
          },
          lineStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: '#B3AEF5' },
              { offset: 0.33, color: '#D7CBE7' },
              { offset: 0.66, color: '#E5C8C8' },
              { offset: 1, color: '#EAA879' },
            ]),
            width: 5,
            join: 'round' as const,
            cap: 'round' as const,
          },
          showSymbol: false,
        },
        futureLockChartData,
      ],
    }
  }, [chartValues, futureLockChartData, theme, nextTheme])

  return {
    lockedUntil,
    chartData: options,
    options,
    onChartReady,
    onEvents,
  }
}
