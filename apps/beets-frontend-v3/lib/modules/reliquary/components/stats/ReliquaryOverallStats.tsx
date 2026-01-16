'use client'

import { Box, Card, Divider, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { InfoIconPopover } from '@repo/lib/modules/pool/actions/create/InfoIconPopover'
import { getTotalAprLabel } from '@repo/lib/modules/pool/pool.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { useCurrentDate } from '@repo/lib/shared/hooks/date.hooks'
import { fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { startOfWeek } from 'date-fns'
import { zeroAddress } from 'viem'
import { useReliquaryGlobalStats } from '../../hooks/useReliquaryGlobalStats'

export default function ReliquaryOverallStats() {
  const { pool } = usePool()
  const { priceFor, getToken } = useTokens()
  const { data: snapshots, latest: globalStats, loading, error } = useReliquaryGlobalStats()
  const networkConfig = useNetworkConfig()
  const today = useCurrentDate()

  const data = pool.dynamicData

  const beetsPerDay = parseFloat(pool.staking?.reliquary?.beetsPerSecond || '0') * 86400
  const incentivesDailyValue =
    beetsPerDay * priceFor(networkConfig.tokens.addresses.beets || zeroAddress, networkConfig.chain)

  const relicTokenBalancesWithSymbol = pool.poolTokens.map(token => ({
    ...token,
    symbol: getToken(token.address, networkConfig.chain)?.symbol,
  }))

  const relicMaturityLevels = globalStats?.levelBalances.map((balance: any) => ({
    level: parseInt(balance.level) + 1,
    percentageOfTotal: parseFloat(balance.balance) / parseFloat(globalStats.totalBalance),
  }))
  const avgRelicMaturity = fNumCustom(
    relicMaturityLevels?.reduce(
      (total: number, obj: any) => total + obj.level * obj.percentageOfTotal,
      0
    ) || 0,
    '0.00'
  )

  const maxPercentageOfLevels = relicMaturityLevels?.reduce((prev: any, curr: any) =>
    prev.percentageOfTotal > curr.percentageOfTotal ? prev : curr
  )
  const cutOffDate = startOfWeek(today).getTime()
  const snapshotsThisWeek = snapshots?.snapshots.filter(
    (snapshot: any) => snapshot.timestamp >= cutOffDate / 1000
  )

  let numberOfRelicsThisWeek = 0
  if (snapshotsThisWeek) {
    numberOfRelicsThisWeek =
      parseInt(snapshotsThisWeek[snapshotsThisWeek.length - 1]?.relicCount || '') -
      parseInt(snapshotsThisWeek[0]?.relicCount || '')
    if (Number.isNaN(numberOfRelicsThisWeek)) {
      numberOfRelicsThisWeek = 0
    }
  }

  const reliquaryPoolRatio =
    parseFloat(globalStats?.totalBalance || '') / parseFloat(data.totalShares)
  const tvl = reliquaryPoolRatio * parseFloat(data.totalLiquidity)
  const avgValuePerRelic = tvl / parseInt(globalStats?.relicCount || '')

  const baseApr = pool.dynamicData.aprItems.find(
    item => item.title === 'BEETS reward APR' && item.type === 'MABEETS_EMISSIONS'
  )

  const dynamicDataAprItems = pool.dynamicData.aprItems.map(item => {
    if (item.title === 'BEETS reward APR' && item.type === 'STAKING_BOOST') {
      return {
        ...item,
        apr: item.apr - (baseApr?.apr || 0),
      }
    } else {
      return item
    }
  })

  if (loading) {
    return (
      <Card h="full" w="full">
        <NoisyCard>
          <VStack
            alignItems="flex-start"
            h="full"
            p={{ base: 'sm', md: 'md' }}
            spacing="4"
            w="full"
          >
            <Skeleton height="60px" w="full" />
            <Skeleton height="120px" w="full" />
            <Skeleton height="80px" w="full" />
            <Skeleton height="80px" w="full" />
          </VStack>
        </NoisyCard>
      </Card>
    )
  }

  if (error) {
    return (
      <Card h="full" w="full">
        <NoisyCard>
          <VStack
            alignItems="flex-start"
            h="full"
            p={{ base: 'sm', md: 'md' }}
            spacing="4"
            w="full"
          >
            <Text color="red.400">Error loading reliquary stats</Text>
            <Text color="gray.400" fontSize="sm">
              {error.message}
            </Text>
          </VStack>
        </NoisyCard>
      </Card>
    )
  }

  return (
    <Card h="full" w="full">
      <NoisyCard cardProps={{ h: 'full' }}>
        <VStack alignItems="flex-start" h="full" p={{ base: 'sm', md: 'md' }} spacing="4" w="full">
          <VStack alignItems="flex-start" spacing="0">
            <Text color="beets.base.50" fontSize="sm" fontWeight="semibold" lineHeight="1rem">
              APR
            </Text>
            <HStack>
              <div className="apr-stripes">{getTotalAprLabel(dynamicDataAprItems)}</div>
              <MainAprTooltip
                aprItems={dynamicDataAprItems}
                chain={networkConfig.chain}
                onlySparkles
                pool={pool}
                poolId={pool.id}
              />
            </HStack>
          </VStack>
          <Divider />
          <VStack alignItems="flex-start" spacing="8" width="full">
            <VStack alignItems="flex-start" spacing="4">
              <VStack alignItems="flex-start" spacing="0" width="full">
                <Text color="beets.base.50" fontSize="sm" fontWeight="semibold" lineHeight="1rem">
                  TVL
                </Text>
                <Text color="white" fontSize="1.75rem">
                  {fNumCustom(tvl, '$0,0.00a')}
                </Text>
              </VStack>
              <VStack alignItems="flex-start" spacing="0" width="full">
                <VStack alignItems="flex-start" mb="2" spacing="1">
                  {relicTokenBalancesWithSymbol?.map((token, index) => (
                    <HStack key={index} mb="0.5" spacing="1">
                      <TokenIcon
                        address={token.address}
                        alt={token.symbol || ''}
                        chain={token.chain ?? undefined}
                      />
                      <Text fontSize="1rem" lineHeight="1rem">
                        {fNum('tokenRatio', reliquaryPoolRatio * parseFloat(token.balance))}
                      </Text>
                      <Text fontSize="1rem" lineHeight="1rem">
                        {token.symbol}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </VStack>
            {pool.staking?.reliquary && (
              <VStack alignItems="flex-start" spacing="0">
                <HStack>
                  <Text color="beets.base.50" fontSize="sm" fontWeight="semibold" lineHeight="1rem">
                    Liquidity incentives
                  </Text>
                  <InfoIconPopover message="Liquidity incentives are additional incentives which are available for maBEETS holders. The daily value is an approximation based on current token prices and emissions." />
                </HStack>
                <Text color="white" fontSize="1.75rem">
                  ~{fNumCustom(incentivesDailyValue, '$0,0.00a')}
                  <Text as="span" fontSize="md">
                    &nbsp;/ day
                  </Text>
                </Text>
                <Box>
                  {beetsPerDay > 0 && (
                    <HStack mb="0.5" spacing="1">
                      <TokenIcon
                        address={networkConfig.tokens.addresses.beets || zeroAddress}
                        alt="beets"
                        chain={networkConfig.chain}
                      />
                      <Text fontSize="1rem" lineHeight="1rem">
                        {fNumCustom(beetsPerDay, '0,0')}&nbsp;/ day
                      </Text>
                    </HStack>
                  )}
                </Box>
              </VStack>
            )}
            <VStack alignItems="flex-start" spacing="0">
              <Text color="beets.base.50" fontSize="sm" fontWeight="semibold" lineHeight="1rem">
                Relic Maturity
              </Text>
              <Text color="white" fontSize="1.75rem">
                {avgRelicMaturity}
                <Text as="span" fontSize="md">
                  &nbsp;avg level
                </Text>
              </Text>
              <Text fontSize="1rem" lineHeight="1rem">
                {`${fNumCustom(maxPercentageOfLevels?.percentageOfTotal || 0, '0%')} of all Relics are level ${maxPercentageOfLevels?.level}`}
              </Text>
            </VStack>
            <VStack alignItems="flex-start" spacing="0">
              <HStack>
                <Text color="beets.base.50" fontSize="sm" fontWeight="semibold" lineHeight="1rem">
                  Total Relics
                </Text>
                <InfoIconPopover message="The total number of 'active' Relics, which have been minted. Burnt Relics are not counted." />
              </HStack>
              <Text color="white" fontSize="1.75rem">
                {fNumCustom(globalStats?.relicCount || 0, '0,0')}
                <Text as="span" fontSize="md">
                  &nbsp;relics
                </Text>
              </Text>
              <Text fontSize="1rem" lineHeight="1rem">
                {`Average value per Relic is $${fNum('fiat', avgValuePerRelic)}`}
              </Text>
              <Text fontSize="1rem" lineHeight="1rem" pt="2">
                {`${numberOfRelicsThisWeek} Relics minted this week`}
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </NoisyCard>
    </Card>
  )
}
