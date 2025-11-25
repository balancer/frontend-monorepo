'use client'

import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Portal,
  Progress,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { getTotalApr } from '@repo/lib/modules/pool/pool.utils'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import Stat from '@repo/lib/shared/components/other/Stat'
import { fNum } from '@repo/lib/shared/utils/numbers'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Countdown from 'react-countdown'
import { BarChart } from 'react-feather'
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton'
import BeetsTooltip from '~/components/tooltip/BeetsTooltip'
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
import { relicGetMaturityProgress } from '../lib/reliquary-helpers'
import { useBatchRelayerHasApprovedForAll } from '../lib/useBatchRelayerHasApprovedForAll'
import { useRelicDepositBalance } from '../lib/useRelicDepositBalance'
import { useRelicHarvestRewards } from '../lib/useRelicHarvestRewards'
import { useRelicPendingRewards } from '../lib/useRelicPendingRewards'
import { LevelUpModal } from './LevelUpModal'
import RelicMaturityModal from './RelicMaturityModal'
import { ReliquaryBatchRelayerApprovalButton } from './ReliquaryBatchRelayerApprovalButton'

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

export function RelicCardSimple({ relic, isSelected = false }: RelicCardSimpleProps) {
  const router = useRouter()
  const { selectedRelicLevel, maturityThresholds, chain, selectedRelicApr, weightedTotalBalance } =
    useReliquary()
  const { relicBalanceUSD } = useRelicDepositBalance()
  const { pool } = usePool()
  const config = useNetworkConfig()
  const { priceFor } = useTokens()
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false)
  const {
    isOpen: isMaturityModalOpen,
    onOpen: onMaturityModalOpen,
    onClose: onMaturityModalClose,
  } = useDisclosure()

  const { data: pendingRewards = [], refetch: refetchPendingRewards } = useRelicPendingRewards()

  const { harvest, ...harvestQuery } = useRelicHarvestRewards(refetchPendingRewards)
  const { data: batchRelayerHasApprovedForAll, refetch: refetchBatchRelayer } =
    useBatchRelayerHasApprovedForAll()

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

  // Calculate pending rewards USD value
  const pendingRewardsUsdValue = pendingRewards.reduce((sum: number, reward: any) => {
    const price = priceFor(reward.address, config.chain)
    return sum + parseFloat(reward.amount) * price
  }, 0)

  // Get maturity progress
  const { progressToNextLevel, levelUpDate, isMaxMaturity, canUpgrade } = relicGetMaturityProgress(
    relic,
    maturityThresholds
  )

  // Check if relic has balance
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
        apr: parseFloat(selectedRelicApr) - (baseApr?.apr || 0),
      }
    } else if (item.title === 'Voting APR Boost' && item.type === 'STAKING_BOOST') {
      return {
        ...item,
        apr: item.apr * ((selectedRelicLevel?.allocationPoints || 0) / 100),
      }
    } else {
      return item
    }
  })
  const [, maxTotalApr] = getTotalApr(dynamicDataAprItems)
  const formattedApr = fNum('apr', maxTotalApr.toString())

  // Calculate Share percentage
  const weightedRelicAmount = parseFloat(relic.amount) * (selectedRelicLevel?.allocationPoints || 0)
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
            onClick={() => router.push('/mabeets/deposit')}
            size="sm"
            variant="primary"
          >
            Deposit
          </Button>
          {hasBalance ? (
            <Button
              flex="1"
              onClick={() => router.push('/mabeets/withdraw')}
              size="sm"
              variant="secondary"
            >
              Withdraw
            </Button>
          ) : (
            <Button flex="1" onClick={() => {}} size="sm" variant="secondary">
              Burn
            </Button>
          )}
          {pendingRewardsUsdValue > 0 && (
            <>
              {!batchRelayerHasApprovedForAll ? (
                <ReliquaryBatchRelayerApprovalButton
                  onConfirmed={() => {
                    refetchBatchRelayer()
                  }}
                />
              ) : (
                <BeetsSubmitTransactionButton
                  disabled={pendingRewardsUsdValue < 0.01}
                  flex="1"
                  isLoading={harvestQuery.isSubmitting || harvestQuery.isPending}
                  onClick={harvest}
                  size="sm"
                  variant="primary"
                >
                  Claim
                </BeetsSubmitTransactionButton>
              )}
            </>
          )}
        </HStack>
      </Box>

      {/* Level Progress Bar */}
      <HStack spacing="2" width="full">
        {/* Left level number */}
        <Text color="white" fontSize="sm" fontWeight="bold">
          {isMaxMaturity ? relic.level : relic.level + 1}
        </Text>

        {/* Progress bar with countdown/max level text inside */}
        <Box flex="1" position="relative">
          <Progress
            colorScheme="blue"
            height="24px"
            rounded="md"
            value={isMaxMaturity ? 100 : progressToNextLevel}
            width="full"
          />
          {/* Text overlay inside progress bar */}
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
            {isMaxMaturity ? 'Max level' : <Countdown date={levelUpDate} />}
          </Box>
        </Box>

        {/* Right level number */}
        <Text color="white" fontSize="sm" fontWeight="bold">
          {relic.level + 1}
        </Text>
      </HStack>

      {/* Stat Cards - 2 per row SimpleGrid */}
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={{ base: 'sm', lg: 'ms' }} width="full">
        {/* Liquidity Card */}
        <Stat
          label="Liquidity"
          value={fNum('fiat', relicBalanceUSD)}
          width={{ base: '100%', md: '100%' }}
        />

        {/* APR Card */}
        <Stat label="APR" value={formattedApr} width={{ base: '100%', md: '100%' }} />

        {/* Maturity Boost Card with Button */}
        <Stat
          label="Maturity boost"
          value={
            <HStack spacing="1">
              <Text>{selectedRelicLevel?.allocationPoints || 1}x</Text>
              <BeetsTooltip label="Click to see the maturity curve" noImage>
                <IconButton
                  aria-label="View maturity curve"
                  icon={<BarChart size={14} />}
                  minW="auto"
                  onClick={onMaturityModalOpen}
                  p="1"
                  size="xs"
                  variant="ghost"
                />
              </BeetsTooltip>
            </HStack>
          }
          width={{ base: '100%', md: '100%' }}
        />

        {/* Pending Rewards Card - Token Amounts Only */}
        <Stat
          label="Pending rewards"
          value={
            pendingRewardsUsdValue > 0 ? (
              <VStack align="start" spacing="1">
                {pendingRewards.map((reward: any, index: number) => {
                  const tokenUsdValue =
                    parseFloat(reward.amount) * priceFor(reward.address, config.chain)
                  return (
                    <HStack key={index} spacing="1">
                      <BeetsTokenSonic height="16px" width="16px" />
                      <Text>
                        {parseFloat(reward.amount).toFixed(2)} (${tokenUsdValue.toFixed(2)})
                      </Text>
                    </HStack>
                  )
                })}
              </VStack>
            ) : (
              '$0.00'
            )
          }
          width={{ base: '100%', md: '100%' }}
        />

        {/* Share Card */}
        <Stat label="Share" value={formattedShare} width={{ base: '100%', md: '100%' }} />

        {/* Potential Daily Yield Card */}
        <Stat
          label="Potential daily yield"
          value={`$${formattedDailyYield}`}
          width={{ base: '100%', md: '100%' }}
        />
      </SimpleGrid>

      {/* Level Up Modal */}
      <LevelUpModal
        chain={chain}
        isOpen={isLevelUpModalOpen}
        nextLevel={relic.level + 1}
        onClose={() => setIsLevelUpModalOpen(false)}
      />

      {/* Maturity Modal */}
      <Portal>
        <RelicMaturityModal isOpen={isMaturityModalOpen} onClose={onMaturityModalClose} />
      </Portal>
    </VStack>
  )
}
