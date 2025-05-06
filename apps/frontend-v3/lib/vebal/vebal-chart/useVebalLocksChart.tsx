'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTheme as useChakraTheme } from '@chakra-ui/react'
import * as echarts from 'echarts/core'
import { EChartsOption, ECharts } from 'echarts'
import {
  format,
  differenceInDays,
  addDays,
  isBefore,
  secondsToMilliseconds,
  millisecondsToSeconds,
} from 'date-fns'
import BigNumber from 'bignumber.js'
import { UseVebalLockInfoResult } from '../../vebal/useVebalLockInfo'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useTheme as useNextTheme } from 'next-themes'
import { useMaxAmountOfVeBAL } from '../useMaxAmountOfVeBal'

type ChartValueAcc = [string, number][]

interface LockSnapshot {
  bias: string
  timestamp: number
  slope: string
}

export const MIN_CHART_VALUES = 2

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

function forecastBalance(snapshot: LockSnapshot, now: BigNumber) {
  const bias = bn(snapshot.bias)
  const slope = bn(snapshot.slope)
  const point2V = bias.minus(slope.times(now.minus(snapshot.timestamp)))

  return point2V.isLessThan(0) ? 0 : point2V.toNumber()
}

function formatDate(timestamp: number) {
  return format(secondsToMilliseconds(timestamp), 'yyyy/MM/dd')
}

function createInterpolatedPoints(firstDay: number, lastDay: number, snapshot: LockSnapshot) {
  const daysDiff = differenceInDays(lastDay, firstDay)
  const interpolatedPoints = []
  if (daysDiff > 30) {
    let currentDay = addDays(firstDay, 7)
    while (isBefore(currentDay, lastDay)) {
      interpolatedPoints.push([
        format(currentDay, 'yyyy/MM/dd'),
        forecastBalance(snapshot, bn(millisecondsToSeconds(currentDay.getTime()))),
      ] as [string, number])
      currentDay = addDays(currentDay, 7)
    }
  }

  return interpolatedPoints
}

function processLockSnapshots(lockSnapshots: LockSnapshot[]) {
  const currentDate = millisecondsToSeconds(Date.now()).toFixed(0)

  return lockSnapshots.reduce((acc: ChartValueAcc, snapshot, i) => {
    const point1Balance = bn(snapshot.bias).toNumber()
    const point1Date = formatDate(snapshot.timestamp)

    const point2Timestamp = lockSnapshots[i + 1]
      ? bn(lockSnapshots[i + 1].timestamp)
      : bn(currentDate)
    const point2Balance = forecastBalance(snapshot, point2Timestamp)
    const point2Date = formatDate(point2Timestamp.toNumber())

    acc.push([point1Date, point1Balance])

    const firstDay = secondsToMilliseconds(snapshot.timestamp)
    const lastDay = secondsToMilliseconds(point2Timestamp.toNumber())
    const interpolatedPoints = createInterpolatedPoints(firstDay, lastDay, snapshot)
    acc.push(...interpolatedPoints)

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

export interface UseVebalLocksChartParams {
  lockSnapshots: LockSnapshot[]
  mainnetLockedInfo: UseVebalLockInfoResult['mainnetLockedInfo']
}

export function useVebalLocksChart({ lockSnapshots, mainnetLockedInfo }: UseVebalLocksChartParams) {
  const theme = useChakraTheme()
  const { theme: nextTheme } = useNextTheme()

  const instanceRef = useRef<ECharts>()

  const userHistoricalLocks = [...lockSnapshots].sort((a, b) => a.timestamp - b.timestamp)

  const lockedUntil = mainnetLockedInfo.lockedEndDate
    ? differenceInDays(new Date(mainnetLockedInfo.lockedEndDate), new Date())
    : 0
  const hasExistingLock = mainnetLockedInfo.hasExistingLock
  const isExpired = mainnetLockedInfo.isExpired

  const chartValues = useMemo(() => {
    const processedValues = processLockSnapshots(
      userHistoricalLocks.map(userHistoricalLock => ({
        ...userHistoricalLock,
        slope: userHistoricalLock.slope,
      }))
    )
    const valuesByDates = groupValuesByDates(processedValues)

    return filterAndFlattenValues(valuesByDates)
  }, [userHistoricalLocks])

  const futureLockChartData = useMemo(() => {
    if (hasExistingLock && !isExpired && userHistoricalLocks.length > 0) {
      const lastSnapshot = userHistoricalLocks[userHistoricalLocks.length - 1]
      const firstDay = Date.now()
      const lastDay = mainnetLockedInfo.lockedEndDate
      const interpolatedPoints = createInterpolatedPoints(firstDay, lastDay, lastSnapshot)

      return {
        id: FUTURE_SERIES_ID,
        name: '',
        type: 'line' as const,
        data: [
          chartValues[chartValues.length - 1],
          ...interpolatedPoints,
          [format(mainnetLockedInfo.lockedEndDate, 'yyyy/MM/dd'), 0],
        ],
        lineStyle: {
          type: [3, 15],
          color: '#EAA879',
          width: 3,
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
  }, [
    chartValues,
    mainnetLockedInfo.lockedEndDate,
    hasExistingLock,
    isExpired,
    userHistoricalLocks,
  ])

  const showStaticTooltip = useCallback(() => {
    if (!mouseoverRef.current && instanceRef.current) {
      // Show tooltip on a specific data point when chart is loaded
      instanceRef.current.dispatchAction({
        type: 'showTip',
        seriesIndex: 0, // Index of the series
        dataIndex: chartValues.length - 1, // Index of the data point
      })
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

  const { isMaxAmountLoading, maxAmount } = useMaxAmountOfVeBAL()

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
      secondaryText:
        nextTheme === 'dark'
          ? theme.semanticTokens.colors.font.secondary._dark
          : theme.semanticTokens.colors.font.secondary.default,
    }

    const badgeStyle =
      'background: #f48975; color: #2D3748; border-radius: 0.25rem; padding-inline-start: 0.25rem; padding-inline-end: 0.25rem'

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
        position: (point, _params, _dom, _rect, size) => {
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
            if (!isMaxAmountLoading) {
              if (
                firstPoint.seriesId === MAIN_SERIES_ID &&
                [firstPoint.dataIndex, secondPoint?.dataIndex].includes(chartValues.length - 1)
              ) {
                return `
                <div style="padding: unset; display: flex; flex-direction: column; justify-content: center;
                  ${toolTipTheme.container}">
                  <div style="font-size: 0.85rem; font-weight: 500; white-space: normal; line-height: 20px; max-width: 150px;
                    color: ${toolTipTheme.text};">
                    Get ${maxAmount.toFixed(4)} veBAL by max extending your lock
                  </div>
                </div>`
              }
            }
          }

          return `
          <div style="padding: unset; display: flex; flex-direction: column;
            justify-content: center; ${toolTipTheme.container}">
            <div style="font-size: 14px; font-weight: 700; display: flex; flex-wrap: wrap;
                justify-content: start; gap: 0px; letter-spacing: -0.25px; padding-bottom: 2px;
                ${toolTipTheme.heading}; color: ${toolTipTheme.secondaryText};">
              veBAL ${format(new Date(firstPointValue[0]), 'dd/MM/yyyy')}
            </div>
            <hr class="chakra-divider" />
            <div style="display: flex; flex-direction: column; font-size: 14px;
                line-height: 20px; font-weight: 500; color: ${toolTipTheme.text};">
              ${
                secondPointValue
                  ? `
                  <span style="display: flex; flex-direction: row; justify-content: space-between">
                    <span style="color: ${toolTipTheme.secondaryText};">Added</span>
                    <span>${fNum('token', secondPointValue[1] - firstPointValue[1])}</span>
                  </span>
                  <span style="display: flex; flex-direction: row; justify-content: space-between">
                    <span style="color: ${toolTipTheme.secondaryText};">Final</span>
                    <span>${fNum('token', secondPointValue[1])}</span>
                  </span>`
                  : `
                  <span>
                    <span>${fNum('token', firstPointValue[1])}</span>
                    ${firstPointValue[1] === 0 ? `<span style="${badgeStyle}">Expired</span>` : ''}
                  </span>`
              }
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
              return format(new Date(secondsToMilliseconds(params.value)), 'MMM d')
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
            width: 3,
            join: 'round' as const,
            cap: 'round' as const,
          },
          showSymbol: false,
        },
        futureLockChartData,
      ],
    }
  }, [chartValues, futureLockChartData, theme, nextTheme, isMaxAmountLoading, maxAmount])

  return {
    lockedUntil,
    chartData: options,
    options,
    onChartReady,
    onEvents,
    insufficientData: chartValues.length < MIN_CHART_VALUES,
  }
}
