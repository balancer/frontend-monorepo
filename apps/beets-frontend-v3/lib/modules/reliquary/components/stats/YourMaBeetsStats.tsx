'use client'

import { Button, HStack, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react'
import { fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { useReliquary } from '../../ReliquaryProvider'
import RelicStat, { StatLabel, StatValueText } from './RelicStat'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useReliquaryGlobalStats } from '../../hooks/useReliquaryGlobalStats'
import { useState } from 'react'
import { ReliquaryClaimAllRewardsModal } from '../ReliquaryClaimAllRewardsModal'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

export function YourMaBeetsStats() {
  const [isClaimAllModalOpen, setIsClaimAllModalOpen] = useState(false)
  const { bptPrice } = usePool()
  const { latest: globalStats, loading: isLoadingGlobalStats } = useReliquaryGlobalStats()
  const { toCurrency } = useCurrency()

  const {
    relicPositions,
    totalMaBeetsVP,
    totalPendingRewardsUSD,
    isLoading: isLoadingReliquary,
  } = useReliquary()

  const isLoading = isLoadingReliquary || isLoadingGlobalStats

  // Calculate total user fBEETS balance - used by multiple stats below
  const userTotalBalance = relicPositions.reduce((sum, relic) => sum + parseFloat(relic.amount), 0)

  // Calculate Total Liquidity
  const totalLiquidity = userTotalBalance * bptPrice

  // Calculate Average Maturity Level (weighted by balance)
  const avgMaturityLevel =
    relicPositions.length > 0 && userTotalBalance > 0
      ? relicPositions.reduce((sum, relic) => {
          const weight = parseFloat(relic.amount) / userTotalBalance
          return sum + (relic.level + 1) * weight // +1 because levels are 0-indexed
        }, 0)
      : 0

  // Calculate Total Relic Share as percentage
  const globalTotalBalance = parseFloat(globalStats?.totalBalance || '1') // Avoid division by zero
  const relicShareDecimal = globalTotalBalance > 0 ? userTotalBalance / globalTotalBalance : 0

  return (
    <VStack align="flex-start" flex="1" spacing="4" width="full">
      <Text
        background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
        backgroundClip="text"
        fontSize="xl"
        fontWeight="bold"
      >
        Your maBEETs Summary
      </Text>
      <SimpleGrid columns={2} spacing={{ base: 'sm', md: 'md' }} w="full">
        <RelicStat>
          <StatLabel label="Your Relics" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{relicPositions.length}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Liquidity" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{toCurrency(totalLiquidity)}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Maturity Level" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{fNumCustom(avgMaturityLevel, '0.00')}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <HStack w="full">
            <VStack alignItems="flex-start" w="full">
              <StatLabel label="Total Pending Rewards" />
              <Skeleton isLoaded={!isLoading} width="50%">
                <StatValueText>{toCurrency(totalPendingRewardsUSD)}</StatValueText>
              </Skeleton>
            </VStack>
            <TooltipWithTouch label={`The minimum amount to claim is ${toCurrency(0.01)}`}>
              <Button
                isDisabled={totalPendingRewardsUSD < 0.01}
                ml="auto"
                onClick={() => setIsClaimAllModalOpen(true)}
                size="sm"
                variant="primary"
                w="full"
              >
                Claim all rewards
              </Button>
            </TooltipWithTouch>
          </HStack>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Relic Share" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{fNum('sharePercent', relicShareDecimal)}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Voting Power" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{fNumCustom(totalMaBeetsVP, '0.000a')} maBEETS</StatValueText>
          </Skeleton>
        </RelicStat>
      </SimpleGrid>
      <ReliquaryClaimAllRewardsModal
        isOpen={isClaimAllModalOpen}
        onClose={() => setIsClaimAllModalOpen(false)}
        onOpen={() => setIsClaimAllModalOpen(true)}
      />
    </VStack>
  )
}
