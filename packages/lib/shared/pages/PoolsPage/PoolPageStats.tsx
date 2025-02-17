'use client'

import { Grid, GridItem } from '@chakra-ui/react'
import Stat from '../../components/other/Stat'
import { fNumCustom } from '../../utils/numbers'
import { useProtocolStats } from '@repo/lib/modules/protocol/ProtocolStatsProvider'

export function PoolPageStats() {
  const { protocolData } = useProtocolStats()

  return (
    <Grid
      gap={{ base: 'lg', lg: 'sm' }}
      mt="3"
      templateColumns={{ base: '1fr 1fr', lg: 'repeat(4, 1fr)' }}
      templateRows={{ base: '1fr 1fr', lg: '1fr' }}
    >
      <GridItem>
        <Stat
          label="TVL"
          value={fNumCustom(protocolData?.protocolMetricsAggregated.totalLiquidity ?? 0, '$0,0.0a')}
        />
      </GridItem>
      <GridItem>
        <Stat
          imageBackgroundSize="300%"
          label="Volume (24h)"
          value={fNumCustom(protocolData?.protocolMetricsAggregated.swapVolume24h ?? 0, '$0,0.0a')}
        />
      </GridItem>
      <GridItem>
        <Stat
          imageTransform="rotate(180deg)"
          label="Fees (24h)"
          value={fNumCustom(protocolData?.protocolMetricsAggregated.swapFee24h ?? 0, '$0,0.0a')}
        />
      </GridItem>
      <GridItem>
        <Stat
          imageBackgroundSize="200%"
          imageTransform="rotate(180deg)"
          label="Protocol Revenue (24h)"
          value={fNumCustom(
            protocolData?.protocolMetricsAggregated.yieldCapture24h ?? 0,
            '$0,0.0a'
          )}
        />
      </GridItem>
    </Grid>
  )
}
