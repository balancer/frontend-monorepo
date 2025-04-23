'use client'

import { Box, Flex } from '@chakra-ui/react'
import Stat from '../../components/other/Stat'
import { bn } from '../../utils/numbers'
import { useProtocolStats } from '@repo/lib/modules/protocol/ProtocolStatsProvider'
import { AnimatedNumber } from '../../components/other/AnimatedNumber'

export function PoolPageStats({ additionalFees }: { additionalFees?: string }) {
  const { protocolData } = useProtocolStats()

  const totalFees = bn(protocolData?.protocolMetricsAggregated.swapFee24h || 0)
    .plus(bn(additionalFees || 0))
    .toString()

  const formatOptions = '$0,0.00a'

  const safeToNumber = (val: string | number | undefined | null): number => {
    const num = Number(val)
    return Number.isNaN(num) ? 0 : num
  }

  return (
    <Flex direction="row" flexWrap="wrap" gap={{ base: 'sm', lg: 'ms' }} mt="3">
      <Box flex="1">
        <Stat
          label="TVL"
          value={
            <AnimatedNumber
              formatOptions={formatOptions}
              value={safeToNumber(protocolData?.protocolMetricsAggregated.totalLiquidity)}
            />
          }
        />
      </Box>
      <Box flex="1">
        <Stat
          imageTransform="rotate(180deg)"
          label="Volume (24h)"
          value={
            <AnimatedNumber
              formatOptions={formatOptions}
              value={safeToNumber(protocolData?.protocolMetricsAggregated.swapVolume24h)}
            />
          }
        />
      </Box>
      <Box flex="1">
        <Stat
          imageTransform="scale(1.5)"
          label={`${additionalFees ? 'Fees' : 'Swap fees'} (24h)`}
          value={<AnimatedNumber formatOptions={formatOptions} value={bn(totalFees).toNumber()} />}
        />
      </Box>
      {/* <Box flex={{ base: '1 1 40%', sm: '1' }}>
        <Stat
          imageBackgroundSize="400%"
          imageTransform="rotate(180deg) scale(2)"
          label="Protocol revenue (24h)"
          value={
            <AnimatedNumber
              formatOptions={'$0,0.0a'}
              value={safeToNumber(protocolData?.protocolMetricsAggregated.yieldCapture24h)}
            />
          }
        />
      </Box> */}
    </Flex>
  )
}
