'use client'

import { Box, Card, HStack, Heading, Skeleton, Tag, Text, VStack } from '@chakra-ui/react'
import { getChainShortName } from '@repo/lib/config/app.config'
import { useMemo } from 'react'
import { useNetworkActivity } from '@analytics/lib/hooks/useNetworkActivity'
import { TimeSeriesChart } from '@analytics/lib/components/charts/TimeSeriesChart'

const numFmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export function NetworkActivityChart() {
  const { data, loading, error } = useNetworkActivity()

  const { xLabels, swapSeries, lpSeries, totalEvents, capped } = useMemo(() => {
    const filtered = data.filter(d => d.total > 0)
    return {
      xLabels: filtered.map(d => getChainShortName(d.chain)),
      swapSeries: {
        name: 'Swaps',
        data: filtered.map(d => [getChainShortName(d.chain), d.swapCount]) as Array<
          [string, number]
        >,
      },
      lpSeries: {
        name: 'Adds / Removes',
        data: filtered.map(d => [getChainShortName(d.chain), d.addRemoveCount]) as Array<
          [string, number]
        >,
      },
      totalEvents: filtered.reduce((acc, d) => acc + d.total, 0),
      capped: filtered.some(d => d.swapCount === 1000 || d.addRemoveCount === 1000),
    }
  }, [data])

  return (
    <Card p={{ base: 4, md: 6 }}>
      <VStack align="stretch" spacing="4">
        <HStack align="start" justify="space-between">
          <Box>
            <Heading size="md">Network activity (24h)</Heading>
            <Text color="font.secondary" fontSize="sm" mt="1">
              v3 vault — swap and liquidity events per chain (subgraph data)
            </Text>
          </Box>
          {!loading && !error && (
            <Tag colorScheme="purple" size="sm">
              {numFmt.format(totalEvents)} events
            </Tag>
          )}
        </HStack>

        {error ? (
          <Text color="red.300" fontSize="sm">
            Failed to load: {error.message}
          </Text>
        ) : loading ? (
          <Skeleton h="320px" />
        ) : data.length === 0 ? (
          <Text color="font.secondary" fontSize="sm">
            No activity in the last 24h.
          </Text>
        ) : (
          <>
            <TimeSeriesChart
              horizontal
              kind="bar"
              series={[swapSeries, lpSeries]}
              valueFormatter={n => numFmt.format(n)}
              xLabels={xLabels}
            />
            {capped && (
              <Text color="font.secondary" fontSize="xs">
                Some chains hit the 1,000-event subgraph cap and may be undercounted.
              </Text>
            )}
          </>
        )}
      </VStack>
    </Card>
  )
}
