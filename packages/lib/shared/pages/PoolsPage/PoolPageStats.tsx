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
import { bn, safeToNumber } from '../../utils/numbers'
import { useProtocolStats } from '@repo/lib/modules/protocol/ProtocolStatsProvider'
import { AnimatedNumber } from '../../components/other/AnimatedNumber'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

type Fee = {
  label: string
  value?: string | number | undefined | null
}

type PoolPageStatsProps = {
  rewardsClaimed24h?: string | number | undefined | null
}

export function PoolPageStats({ rewardsClaimed24h }: PoolPageStatsProps) {
  const { protocolData } = useProtocolStats()

  const surplus24h = protocolData?.protocolMetricsAggregated.surplus24h
  const feeLabel = isBalancer ? 'Yield (24h)' : 'Fees (24h)'

  const fees: Fee[] = [
    {
      label: 'Swap fees',
      value: protocolData?.protocolMetricsAggregated.swapFee24h,
    },
    {
      label: 'Yield-bearing tokens',
      value: protocolData?.protocolMetricsAggregated.yieldCapture24h,
    },
  ]

  if (rewardsClaimed24h && rewardsClaimed24h !== '0') {
    fees.push({
      label: 'stS rewards',
      value: rewardsClaimed24h,
    })
  }

  if (surplus24h && surplus24h !== '0') {
    fees.push({
      label: 'CoW AMM LVR surplus',
      value: surplus24h,
    })
  }

  const totalFees = fees
    .reduce((sum, fee) => {
      return sum.plus(bn(fee.value || 0))
    }, bn(0))
    .toString()

  const formatOptions = '$0,0.00a'

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
                label={feeLabel}
                popover
                value={
                  <AnimatedNumber formatOptions={formatOptions} value={safeToNumber(totalFees)} />
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
                {fees.map(fee => (
                  <Flex align="center" justify="space-between" key={fee.label}>
                    <Text color="font.secondary" fontSize="xs">
                      {fee.label}
                    </Text>
                    <Text className="home-stats" color="font.secondary" fontSize="xs">
                      <AnimatedNumber
                        formatOptions={formatOptions}
                        value={safeToNumber(fee.value)}
                      />
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Flex>
  )
}
