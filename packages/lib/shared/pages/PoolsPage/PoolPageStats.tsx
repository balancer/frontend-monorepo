'use client'

import {
  Box,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
} from '@chakra-ui/react'
import Stat from '../../components/other/Stat'
import { bn } from '../../utils/numbers'
import { useProtocolStats } from '@repo/lib/modules/protocol/ProtocolStatsProvider'
import { AnimatedNumber } from '../../components/other/AnimatedNumber'

export function PoolPageStats({ additionalFees }: { additionalFees?: string }) {
  const { protocolData } = useProtocolStats()

  const totalYield = bn(protocolData?.protocolMetricsAggregated.swapFee24h || 0)
    .plus(bn(protocolData?.protocolMetricsAggregated.yieldCapture24h || 0))
    .plus(bn(protocolData?.protocolMetricsAggregated.surplus24h || 0))
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

      <Box flex={{ base: '1 1 40%', sm: '1' }}>
        {!additionalFees ? (
          <Popover
            modifiers={[{ name: 'offset', options: { offset: [0, -24] } }]}
            placement="top"
            trigger="hover"
          >
            <PopoverTrigger>
              <Box>
                <Stat
                  imageBackgroundSize="400%"
                  imageTransform="rotate(180deg) scale(2)"
                  label="Yield (24h)"
                  value={
                    <AnimatedNumber
                      formatOptions={formatOptions}
                      value={safeToNumber(totalYield)}
                    />
                  }
                />
              </Box>
            </PopoverTrigger>
            <PopoverContent
              bg="background.level0"
              borderRadius="md"
              minW="200px"
              p={2}
              shadow="2xl"
              w="auto"
              zIndex={9999}
            >
              <PopoverBody p="0">
                <Flex direction="column" gap={1}>
                  <Flex align="center" justify="space-between">
                    <Text color="font.secondary" fontSize="xs">
                      Swap fees
                    </Text>
                    <Text className="home-stats" color="font.secondary" fontSize="xs">
                      <AnimatedNumber
                        formatOptions={formatOptions}
                        value={safeToNumber(protocolData?.protocolMetricsAggregated.swapFee24h)}
                      />
                    </Text>
                  </Flex>
                  <Flex align="center" justify="space-between">
                    <Text color="font.secondary" fontSize="xs">
                      Yield-bearing tokens
                    </Text>
                    <Text className="home-stats" color="font.secondary" fontSize="xs">
                      <AnimatedNumber
                        formatOptions={formatOptions}
                        value={safeToNumber(
                          protocolData?.protocolMetricsAggregated.yieldCapture24h
                        )}
                      />
                    </Text>
                  </Flex>
                  <Flex align="center" justify="space-between">
                    <Text color="font.secondary" fontSize="xs">
                      CoW AMM LVR surplus
                    </Text>
                    <Text className="home-stats" color="font.secondary" fontSize="xs">
                      <AnimatedNumber
                        formatOptions={formatOptions}
                        value={safeToNumber(protocolData?.protocolMetricsAggregated.surplus24h)}
                      />
                    </Text>
                  </Flex>
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          <Stat
            imageBackgroundSize="400%"
            imageTransform="rotate(180deg) scale(2)"
            label="Fees (24h)"
            value={
              <AnimatedNumber formatOptions={formatOptions} value={safeToNumber(totalYield)} />
            }
          />
        )}
      </Box>
    </Flex>
  )
}
