'use client'

import { Box, Card, Flex, HStack, Heading, Skeleton, Text, VStack } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'
import { useTvlSeries } from '@analytics/lib/hooks/useTvlSeries'
import { DeltaPill } from './DeltaPill'

type Mode = 'TVL' | 'VOLUME'
type Range = '7D' | '30D' | '90D' | '1Y' | 'ALL'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

// "Feb 1" by default; promotes to "Feb 1, 2026" when the range crosses year boundaries.
const dateLabelFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const dateLabelLongFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const tooltipDateFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const SERIES_COLORS = {
  v2: '#9f95f0',
  v3: '#E6C6A0',
  cow: '#25e2a4',
} as const

const SERIES_LABEL = {
  v2: 'Balancer v2',
  v3: 'Balancer v3',
  cow: 'CoW AMM',
} as const

export function TvlOverviewChart() {
  const [mode, setMode] = useState<Mode>('TVL')
  const [range, setRange] = useState<Range>('90D')
  const { data, loading } = useTvlSeries({ range, mode })

  // When the range spans multiple years, axis labels include the year.
  const showYearInAxis = useMemo(() => {
    if (!data?.points.length) return false
    const first = data.points[0].t
    const last = data.points.at(-1)!.t
    return new Date(first).getUTCFullYear() !== new Date(last).getUTCFullYear()
  }, [data])

  const option = useMemo(() => {
    if (!data) return null
    const pts = data.points
    const fmtAxis = (val: number) =>
      (showYearInAxis ? dateLabelLongFmt : dateLabelFmt).format(new Date(val))

    const mkArea = (key: 'v2' | 'v3' | 'cow') => ({
      name: SERIES_LABEL[key],
      type: 'line' as const,
      stack: 'protocol',
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 0 },
      areaStyle: { color: SERIES_COLORS[key], opacity: 0.85 },
      emphasis: { focus: 'series' as const },
      data: pts.map(p => [p.t, p[key]]),
    })

    return {
      grid: { left: 8, right: 56, top: 12, bottom: 24 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#383E47',
        borderColor: 'rgba(229,211,190,0.08)',
        textStyle: { color: '#E5D3BE' },
        formatter: (params: any) => {
          if (!Array.isArray(params) || !params.length) return ''
          const ts = params[0].value?.[0] ?? params[0].axisValue
          const date = tooltipDateFmt.format(new Date(ts))
          const rows = params
            .slice()
            .reverse() // cow on top of legend mirrors visual stack order
            .map(p => {
              const v = Array.isArray(p.value) ? Number(p.value[1]) : Number(p.value)
              return `
                <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color}"></span>
                  <span style="flex:1;color:#A0AEC0">${p.seriesName}</span>
                  <span style="font-weight:600">${usd(v)}</span>
                </div>`
            })
            .join('')
          const total = params.reduce((acc: number, p: any) => {
            const v = Array.isArray(p.value) ? Number(p.value[1]) : Number(p.value)
            return acc + (Number.isFinite(v) ? v : 0)
          }, 0)
          return `
            <div style="min-width:200px">
              <div style="color:#E5D3BE;font-weight:600;margin-bottom:4px">${date}</div>
              ${rows}
              <div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid rgba(229,211,190,0.12)">
                <span style="color:#A0AEC0">Total</span>
                <span style="font-weight:700">${usd(total)}</span>
              </div>
            </div>`
        },
      },
      legend: {
        show: false,
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: 'rgba(229,211,190,0.06)' } },
        axisLabel: {
          color: '#718096',
          fontSize: 10,
          hideOverlap: true,
          formatter: fmtAxis,
        },
      },
      yAxis: {
        type: 'value',
        position: 'right',
        splitLine: { lineStyle: { color: 'rgba(229,211,190,0.05)', type: 'dashed' } },
        axisLabel: { color: '#718096', fontSize: 10, formatter: usd },
      },
      series: [mkArea('v2'), mkArea('v3'), mkArea('cow')],
    }
  }, [data, showYearInAxis])

  const latest = data?.points.at(-1)
  const totalNow = latest?.value ?? 0

  return (
    <Card overflow="hidden" position="relative" variant="level1">
      <Flex align="flex-start" flexWrap="wrap" gap="ms" justify="space-between" mb="md">
        <VStack align="flex-start" spacing="xs">
          <Heading size="h6">Protocol {mode === 'TVL' ? 'liquidity' : 'volume'}</Heading>
          <HStack spacing="md">
            <LegendSwatch color={SERIES_COLORS.v2} label="v2" />
            <LegendSwatch color={SERIES_COLORS.v3} label="v3" />
            <LegendSwatch color={SERIES_COLORS.cow} label="CoW AMM" />
          </HStack>
        </VStack>
        <HStack spacing="sm">
          <SegBtns onChange={setMode} options={['TVL', 'VOLUME']} value={mode} />
          <SegBtns
            onChange={setRange}
            options={['7D', '30D', '90D', '1Y', 'ALL']}
            value={range}
          />
        </HStack>
      </Flex>

      <HStack align="baseline" mb="sm" spacing="md">
        <Heading color="font.maxContrast" letterSpacing="-0.6px" size="h3">
          {data ? usd(totalNow) : '—'}
        </Heading>
        {data?.change24h != null && <DeltaPill value={data.change24h} />}
        <Text color="font.secondary" fontSize="xs">
          vs 24h ago
        </Text>
      </HStack>

      {loading || !option ? (
        <Skeleton h="288px" />
      ) : (
        <Box h="288px">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </Box>
      )}
    </Card>
  )
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <HStack spacing="xxs">
      <Box bg={color} borderRadius="2px" h="8px" w="8px" />
      <Text color="font.secondary" fontSize="xs">
        {label}
      </Text>
    </HStack>
  )
}

function SegBtns<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <HStack
      bg="background.level0"
      border="1px solid"
      borderColor="border.subduedZen"
      borderRadius="full"
      p="3px"
      spacing={0}
    >
      {options.map(o => (
        <Box
          as="button"
          bg={value === o ? 'background.level3' : 'transparent'}
          borderRadius="full"
          color={value === o ? 'font.maxContrast' : 'font.secondary'}
          fontSize="xs"
          fontWeight="medium"
          key={o}
          onClick={() => onChange(o)}
          px="ms"
          py="xs"
        >
          {o}
        </Box>
      ))}
    </HStack>
  )
}
