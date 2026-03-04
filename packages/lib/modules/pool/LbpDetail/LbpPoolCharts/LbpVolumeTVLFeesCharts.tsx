import * as React from 'react';
import ReactECharts from 'echarts-for-react'
import { HourlyDataPoint } from '@repo/lib/modules/lbp/pool/usePriceInfo'
import {
  PoolChartTab,
  usePoolChartTabs } from '../../PoolDetail/PoolStats/PoolCharts/PoolChartTabsProvider'
import {
  getDefaultPoolChartOptions,
  PoolChartTypeOptions } from '@repo/lib/modules/pool/PoolDetail/PoolStats/PoolCharts/PoolChartsProvider'
import { Box, Skeleton, Stack, Text, useChakraContext } from '@chakra-ui/react';
import { useTheme as useNextTheme } from 'next-themes'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  chartType: PoolChartTab
  hourlyData: HourlyDataPoint[]
  isLoading?: boolean
  hasHourlyData?: boolean
}

type SupportedPoolChartTab = PoolChartTab.VOLUME | PoolChartTab.TVL | PoolChartTab.FEES

function resolveToken(system: ReturnType<typeof useChakraContext>, path: string): string {
  const cssVar = system.token.var(`colors.${path}`)
  if (typeof window === 'undefined') return ''
  const varName = cssVar.slice(4, -1) // strip 'var(' and ')'
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

export function LbpVolumeTVLFeesCharts({
  chartType,
  hourlyData = [],
  isLoading = false,
  hasHourlyData = false }: Props) {
  const system = useChakraContext()
  const { toCurrency } = useCurrency()
  const { resolvedTheme: nextTheme } = useNextTheme()
  const { activeTab } = usePoolChartTabs()

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
            color: resolveToken(system, 'chart.pool.bar.volume.from') },
          {
            offset: 1,
            color: resolveToken(system, 'chart.pool.bar.volume.to') },
        ] },
      hoverColor: '#ED64A6' },
    [PoolChartTab.TVL]: {
      type: 'line',
      color: '#3182CE',
      hoverBorderColor: '#ED64A6',
      hoverColor: '#171923',
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
              color: 'rgba(14, 165, 233, 0.08)' },
            {
              offset: 1,
              color: 'rgba(68, 9, 236, 0)' },
          ] } } },
    [PoolChartTab.FEES]: {
      type: 'bar',
      color: '#F6E05E',
      hoverColor: '#ED64A6' } }

  const getChartData = (): Array<[number, number]> => {
    if ((!hourlyData || !hourlyData.length) && chartType !== PoolChartTab.PRICE) {
      return []
    }

    switch (chartType) {
      case PoolChartTab.VOLUME:
        return hourlyData.map(item => [item.timestamp, item.volume])
      case PoolChartTab.FEES:
        return hourlyData.map(item => [item.timestamp, item.fees])
      case PoolChartTab.TVL:
      default:
        return hourlyData.map(item => [item.timestamp, item.tvl])
    }
  }

  const chartData = getChartData()
  const defaultChartOptions = getDefaultPoolChartOptions(
    toCurrency,
    nextTheme,
    system,
    {
      useTimeRange: true }
  )

  const option = useMemo(() => {
    const activeTabOptions = poolChartTypeOptions[chartType as SupportedPoolChartTab] || {
      type: 'line',
      color: '#4299E1',
      hoverColor: '#ED64A6' }

    return {
      ...defaultChartOptions,
      grid: {
        left: '7%',
        right: '4%',
        top: '10%',
        bottom: '10%' },
      series: [
        {
          type: activeTabOptions.type,
          data: chartData,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2 },
          itemStyle: {
            color: activeTabOptions.color,
            borderRadius: 100 },
          emphasis: {
            itemStyle: {
              color: activeTabOptions.hoverColor,
              borderColor: activeTabOptions.hoverBorderColor } },
          areaStyle: activeTabOptions.areaStyle,
          animationEasing: function (k: number) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
          } },
      ] }
  }, [chartType, chartData, defaultChartOptions, poolChartTypeOptions])

  if (isLoading) {
    return <Skeleton h="full" w="full" />
  }

  if (!hasHourlyData) {
    return (
      <Stack alignItems="center" h="full" justifyContent="center">
        <Text color="font.secondary" fontSize="lg">
          No {chartType.toLowerCase()} data available
        </Text>
      </Stack>
    )
  }

  return (
    <Box h="full" overflow="hidden" position="relative" w="full">
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ x: '0%' }}
          exit={{ x: '-100%' }}
          initial={{ x: '100%' }}
          key={activeTab.value}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}
