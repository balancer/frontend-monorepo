'use client'

import { Box, Flex } from '@chakra-ui/react'
import Stat from '../../components/other/Stat'
import { fNumCustom } from '../../utils/numbers'
import { useProtocolStats } from '@repo/lib/modules/protocol/ProtocolStatsProvider'

export function PoolPageStats() {
  const { protocolData } = useProtocolStats()

  return (
    <Flex direction="row" flexWrap="wrap" gap={{ base: 'sm', lg: 'sm' }} mt="3">
      <Box flex="1">
        <Stat
          label="TVL"
          value={fNumCustom(protocolData?.protocolMetricsAggregated.totalLiquidity ?? 0, '$0,0.0a')}
        />
      </Box>
      <Box flex="1">
        <Stat
          imageTransform="rotate(180deg)"
          label="Volume (24h)"
          value={fNumCustom(protocolData?.protocolMetricsAggregated.swapVolume24h ?? 0, '$0,0.0a')}
        />
      </Box>
      <Box flex="1">
        <Stat
          imageTransform="scale(1.5)"
          label="Swap fees (24h)"
          value={fNumCustom(protocolData?.protocolMetricsAggregated.swapFee24h ?? 0, '$0,0.0a')}
        />
      </Box>
      {/* <Box flex={{ base: '1 1 40%', sm: '1' }}>
        <Stat
          imageBackgroundSize="400%"
          imageTransform="rotate(180deg) scale(2)"
          label="Protocol revenue (24h)"
          value={fNumCustom(
            protocolData?.protocolMetricsAggregated.yieldCapture24h ?? 0,
            '$0,0.0a'
          )}
        />
      </Box> */}
    </Flex>
  )
}
