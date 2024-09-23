import { useMemo } from 'react'
import { useTheme as useChakraTheme } from '@chakra-ui/react'

import * as echarts from 'echarts/core'
import { format, differenceInDays } from 'date-fns'
import BigNumber from 'bignumber.js'
import { lockSnapshots } from './test-locks'
import { useVebalLockInfo } from '../../vebal/useVebalLockInfo'
import { bn } from '@/lib/shared/utils/numbers'

type ChartValueAcc = (readonly [string, number])[]

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

export function useVebalLocksChart() {
  const theme = useChakraTheme()

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
        name: '',
        type: 'line',
        data: [
          chartValues[chartValues.length - 1],
          [format(new Date(mainnetLockedInfo.lockedEndDate).getTime(), 'yyyy/MM/dd'), 0],
        ],
        lineStyle: {
          type: 'dashed',
        },
      }
    }
    return {
      name: '',
      type: 'line',
      data: [],
    }
  }, [chartValues, mainnetLockedInfo.lockedEndDate, hasExistingLock, isExpired])

  const options = useMemo(() => {
    const toolTipTheme = {
      heading: 'font-weight: bold; color: #E5D3BE',
      container: `background: ${theme.colors.gray[800]};`,
      text: theme.colors.gray[400],
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
        extraCssText: `padding-right:2rem;border: none;${toolTipTheme.container}`,
        formatter: (params: any) => {
          const firstPoint = Array.isArray(params) ? params[0] : params
          const secondPoint = Array.isArray(params) ? params[1] : null

          return `
            <div style="padding: none; display: flex; flex-direction: column; justify-content: center;${
              toolTipTheme.container
            }">
              <div style="font-size: 0.85rem; font-weight: 500; color: ${toolTipTheme.text};">
                ${format(new Date(firstPoint.value[0]), 'yyyy/MM/dd')}
              </div>
              <div style="display: flex; flex-direction: column; font-size: 14px; font-weight: 500; color: ${
                toolTipTheme.text
              };">
                <span>${secondPoint ? `${secondPoint.value[1]} veBAL` : ''}</span>
                <span>${firstPoint.value[1]} veBAL</span>
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
          name: '',
          type: 'line',
          data: chartValues,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(14, 165, 233, 0.08)' },
              { offset: 1, color: 'rgba(68, 9, 236, 0)' },
            ]),
          },
        },
        futureLockChartData,
      ],
    }
  }, [chartValues, futureLockChartData, theme])

  return {
    lockedUntil,
    chartData: options,
    options,
  }
}
