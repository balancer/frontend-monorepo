'use client'

import { Box, Card, Flex, HStack, Heading, Skeleton, Tag, Text, VStack } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'
import { useTvlSeries } from '@analytics/lib/hooks/useTvlSeries'
import { DeltaPill } from './DeltaPill'

type Mode = 'TVL' | 'VOLUME'
type Range = '7D' | '30D' | '90D' | '1Y' | 'ALL'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n)

export function TvlOverviewChart() {
  const [mode, setMode] = useState<Mode>('TVL')
  const [range, setRange] = useState<Range>('90D')
  const { data, loading } = useTvlSeries({ range, mode })

  const option = useMemo(() => {
    if (!data) return null
    const series = data.points
    return {
      grid: { left: 8, right: 56, top: 12, bottom: 24 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#383E47',
        borderColor: 'rgba(229,211,190,0.08)',
        textStyle: { color: '#E5D3BE', fontFamily: 'monospace' },
        valueFormatter: (v: number) => usd(v),
      },
      xAxis: {
        type: 'category',
        data: series.map(p => p.date),
        axisLine: { lineStyle: { color: 'rgba(229,211,190,0.06)' } },
        axisLabel: { color: '#718096', fontSize: 10, fontFamily: 'monospace' },
      },
      yAxis: {
        type: 'value',
        position: 'right',
        splitLine: { lineStyle: { color: 'rgba(229,211,190,0.05)', type: 'dashed' } },
        axisLabel: { color: '#718096', fontSize: 10, fontFamily: 'monospace', formatter: usd },
      },
      series: [{
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.8, color: mode === 'TVL' ? '#E6C6A0' : '#EA9A43' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: mode === 'TVL' ? 'rgba(230,198,160,0.22)' : 'rgba(234,154,67,0.22)' },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ],
          },
        },
        data: series.map(p => p.value),
      }],
    }
  }, [data, mode])

  return (
    <Card overflow="hidden" position="relative" variant="level1">
      <Flex align="flex-start" flexWrap="wrap" gap="ms" justify="space-between" mb="md">
        <VStack align="flex-start" spacing="xs">
          <HStack spacing="sm">
            <Heading size="h6">
              Protocol {mode === 'TVL' ? 'liquidity' : 'volume'}
            </Heading>
            <Tag colorScheme="green" size="sm" variant="subtle">
              snapshot pending
            </Tag>
          </HStack>
          <Text color="font.secondary" fontSize="xs">
            {data ? `${data.points[0]?.date} → ${data.points.at(-1)?.date}` : 'Awaiting backend snapshotter'}
          </Text>
        </VStack>
        <HStack spacing="sm">
          <SegBtns onChange={setMode as any} options={['TVL', 'VOLUME']} value={mode} />
          <SegBtns onChange={setRange as any} options={['7D', '30D', '90D', '1Y', 'ALL']} value={range} />
        </HStack>
      </Flex>

      <HStack align="baseline" mb="sm" spacing="md">
        <Heading color="font.maxContrast" letterSpacing="-0.6px" size="h3">
          {data ? usd(data.points.at(-1)?.value ?? 0) : '—'}
        </Heading>
        {data?.change24h != null && <DeltaPill value={data.change24h} />}
        <Text color="font.secondary" fontSize="xs">
          vs 24h ago
        </Text>
      </HStack>

      {loading || !option ? (
        <Skeleton h="240px" />
      ) : (
        <Box h="240px">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </Box>
      )}
    </Card>
  )
}

function SegBtns<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[]
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
