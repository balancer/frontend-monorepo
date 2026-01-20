'use client'

import { Badge, Box, Button, HStack, Progress, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { getTotalApr } from '@repo/lib/modules/pool/pool.utils'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { fNum } from '@repo/lib/shared/utils/numbers'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Countdown from 'react-countdown'
import { formatUnits } from 'viem'
import { ReliquaryFarmPosition, useReliquary } from '../ReliquaryProvider'
import RelicLevel1 from '../assets/1.png'
import RelicLevel10 from '../assets/10.png'
import RelicLevel11 from '../assets/11.png'
import RelicLevel2 from '../assets/2.png'
import RelicLevel3 from '../assets/3.png'
import RelicLevel4 from '../assets/4.png'
import RelicLevel5 from '../assets/5.png'
import RelicLevel6 from '../assets/6.png'
import RelicLevel7 from '../assets/7.png'
import RelicLevel8 from '../assets/8.png'
import RelicLevel9 from '../assets/9.png'
import { BeetsTokenSonic } from '../assets/BeetsTokenSonic'
import { useGetPendingReward } from '../hooks/useGetPendingReward'
import { relicGetMaturityProgress } from '../lib/reliquary-helpers'
import { useRelicDepositBalance } from '../lib/useRelicDepositBalance'
import { LevelUpModal } from './LevelUpModal'
import { BurnModal } from './BurnModal'
import { ReliquaryClaimModal } from './ReliquaryClaimModal'
import { RelicMaturityCurveChart } from './charts/RelicMaturityCurveChart'
import RelicStat, { StatLabel, StatValueText } from './stats/RelicStat'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'

interface RelicCardSimpleProps {
  relic: ReliquaryFarmPosition
  isSelected?: boolean
}

function getImage(level: number) {
  switch (level) {
    case 1:
      return RelicLevel1
    case 2:
      return RelicLevel2
    case 3:
      return RelicLevel3
    case 4:
      return RelicLevel4
    case 5:
      return RelicLevel5
    case 6:
      return RelicLevel6
    case 7:
      return RelicLevel7
    case 8:
      return RelicLevel8
    case 9:
      return RelicLevel9
    case 10:
      return RelicLevel10
    case 11:
      return RelicLevel11
    default:
      return RelicLevel1
  }
}

export function RelicCard({ relic, isSelected = false }: RelicCardSimpleProps) {
  const router = useRouter()
  const { reliquaryLevels, maturityThresholds, chain, weightedTotalBalance } = useReliquary()
  const { relicBalanceUSD } = useRelicDepositBalance(relic.relicId)
  const { pool } = usePool()
  const config = useNetworkConfig()
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false)
  const { data: pendingRewards, usdValue: pendingRewardsUsdValue } = useGetPendingReward(
    relic.relicId,
    chain
  )
  const { toCurrency } = useCurrency()

  // Get Relic level data for this specific Relic
  const relicLevel = reliquaryLevels.find(level => level.level === relic.level)
  const relicApr = relicLevel?.apr || '0'
  const allocationPoints = relicLevel?.allocationPoints || 1

  const levelNames = [
    'The Initiate',
    'The Neophyte',
    'The Wanderer',
    'The Rebel',
    'The Skeptic',
    'The Apprentice',
    'The Journeyman',
    'The Savant',
    'The Creator',
    'The Scholar',
    'The Awakened',
  ]

  // Get maturity progress
  const { progressToNextLevel, levelUpDate, isMaxMaturity, canUpgrade, canUpgradeTo } =
    relicGetMaturityProgress(relic, maturityThresholds)

  // Check if Relic has balance
  const hasBalance = parseFloat(relic.amount) > 0

  // Calculate APR with boost
  const baseApr = pool.dynamicData.aprItems.find(
    item => item.title === 'BEETS reward APR' && item.type === 'MABEETS_EMISSIONS'
  )
  const dynamicDataAprItems = pool.dynamicData.aprItems.map(item => {
    if (item.title === 'BEETS reward APR' && item.type === 'STAKING_BOOST') {
      return {
        ...item,
        title: 'BEETS reward APR',
        apr: parseFloat(relicApr) - (baseApr?.apr || 0),
      }
    } else if (item.title === 'Voting APR Boost' && item.type === 'STAKING_BOOST') {
      return {
        ...item,
        apr: item.apr * (allocationPoints / 100),
      }
    } else {
      return item
    }
  })
  const [, maxTotalApr] = getTotalApr(dynamicDataAprItems)
  const formattedApr = fNum('apr', maxTotalApr.toString())

  // Calculate Share percentage
  const weightedRelicAmount = parseFloat(relic.amount) * allocationPoints
  const relicShare = weightedTotalBalance > 0 ? weightedRelicAmount / weightedTotalBalance : 0
  const formattedShare = `${(relicShare * 100).toFixed(2)}%`

  // Calculate Potential Daily Yield
  const dailyYield = (relicBalanceUSD * maxTotalApr.toNumber()) / 365
  const formattedDailyYield = fNum('fiat', dailyYield)

  return (
    <VStack
      _hover={{
        opacity: 1,
      }}
      opacity={isSelected ? 1 : 0.5}
      spacing="4"
      transform={isSelected ? 'scale(1)' : 'scale(0.85)'}
      transition="all 300ms ease"
      width="full"
    >
      {/* Badges */}
      <HStack justify="space-between" width="full">
        <Badge colorScheme="green" fontSize="sm" px="3" py="1">
          Level {relic.level + 1} - {levelNames[relic.level] || 'Unknown'}
        </Badge>
        <Badge colorScheme="blue" fontSize="sm" px="3" py="1">
          Relic #{relic.relicId}
        </Badge>
      </HStack>

      {/* Relic Image */}
      <Box
        alignItems="center"
        borderRadius="lg"
        boxShadow={isSelected ? '0 0 30px rgba(5, 214, 144, 0.4)' : 'none'}
        display="flex"
        justifyContent="center"
        overflow="hidden"
        position="relative"
        width="full"
      >
        <Image
          alt={`Relic ${relic.relicId}`}
          draggable={false}
          height={400}
          placeholder="blur"
          src={getImage(relic?.level + 1)}
          style={{ margin: '0 auto', userSelect: 'none' }}
          width={400}
        />

        {/* Level Up Button - Center Overlay */}
        {canUpgrade && (
          <Button
            colorScheme="green"
            left="50%"
            onClick={() => setIsLevelUpModalOpen(true)}
            position="absolute"
            size="lg"
            top="50%"
            transform="translate(-50%, -50%)"
            zIndex="2"
          >
            Level Up
          </Button>
        )}

        {/* Action Buttons Overlay at Bottom */}
        <HStack
          bottom="0"
          left="0"
          p="3"
          position="absolute"
          right="0"
          spacing="2"
          sx={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          }}
        >
          <Button
            flex="1"
            onClick={() => router.push(`/mabeets/deposit/${relic.relicId}`)}
            size="sm"
            variant="primary"
          >
            Deposit
          </Button>
          {hasBalance ? (
            <Button
              flex="1"
              onClick={() => router.push(`/mabeets/withdraw/${relic.relicId}`)}
              size="sm"
              variant="secondary"
            >
              Withdraw
            </Button>
          ) : (
            <Button flex="1" onClick={() => setIsBurnModalOpen(true)} size="sm" variant="secondary">
              Burn
            </Button>
          )}
          <Box flex="1">
            <TooltipWithTouch label={`The minimum amount to claim is ${toCurrency(0.01)}`}>
              <Button
                isDisabled={pendingRewardsUsdValue.lt(0.01)}
                onClick={() => setIsClaimModalOpen(true)}
                size="sm"
                variant="secondary"
                w="full"
              >
                Claim
              </Button>
            </TooltipWithTouch>
          </Box>
        </HStack>
      </Box>
      <HStack spacing="2" width="full">
        {!isMaxMaturity && (
          <Text color="white" fontSize="sm" fontWeight="bold">
            {relic.level + 1}
          </Text>
        )}
        <Box flex="1" position="relative">
          <Progress
            colorScheme="blue"
            height="24px"
            rounded="md"
            value={isMaxMaturity ? 100 : progressToNextLevel}
            width="full"
          />
          <Box
            color="black"
            fontSize="xs"
            fontWeight="semibold"
            left="50%"
            position="absolute"
            top="50%"
            transform="translate(-50%, -50%)"
            zIndex="1"
          >
            {canUpgrade ? (
              `Level up to ${canUpgradeTo}`
            ) : isMaxMaturity ? (
              'Max level'
            ) : (
              <Countdown date={levelUpDate} />
            )}
          </Box>
        </Box>
        {!isMaxMaturity && (
          <Text color="white" fontSize="sm" fontWeight="bold">
            {relic.level + 2}
          </Text>
        )}
      </HStack>
      <SimpleGrid columns={{ base: 2, sm: 2 }} spacing={{ base: 'sm', lg: 'ms' }} width="full">
        <RelicStat>
          <StatLabel label="Liquidity" />
          <StatValueText>{toCurrency(relicBalanceUSD)}</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="APR" />
          <HStack spacing="3">
            <StatValueText>{formattedApr}</StatValueText>
            <MainAprTooltip
              aprItems={dynamicDataAprItems}
              chain={config.chain}
              onlySparkles
              pool={pool}
              poolId={pool.id}
            />
          </HStack>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Maturity boost" />
          <StatValueText>{allocationPoints}x</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Pending rewards" />
          {pendingRewardsUsdValue.gt(0.01) ? (
            <HStack spacing="1">
              <BeetsTokenSonic height="16px" width="16px" />
              <StatValueText>
                {pendingRewards ? parseFloat(formatUnits(pendingRewards, 18)).toFixed(6) : 0} (
                {toCurrency(pendingRewardsUsdValue)})
              </StatValueText>
            </HStack>
          ) : (
            '-'
          )}
        </RelicStat>
        <RelicStat>
          <StatLabel label="Share" />
          <StatValueText>{formattedShare}</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Potential daily yield" />
          <StatValueText>${formattedDailyYield}</StatValueText>
        </RelicStat>
      </SimpleGrid>
      <RelicStat>
        <StatLabel label="Maturity Progress" />
        <Box height="120px" width="full">
          <RelicMaturityCurveChart currentLevel={relic.level} />
        </Box>
      </RelicStat>
      <LevelUpModal
        chain={chain}
        isOpen={isLevelUpModalOpen}
        nextLevel={relic.level + 2}
        onClose={() => setIsLevelUpModalOpen(false)}
        relicId={relic.relicId}
      />
      <ReliquaryClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onOpen={() => setIsClaimModalOpen(true)}
        relicId={relic.relicId}
      />
      <BurnModal
        chain={chain}
        isOpen={isBurnModalOpen}
        onClose={() => setIsBurnModalOpen(false)}
        relicId={relic.relicId}
      />
    </VStack>
  )
}
