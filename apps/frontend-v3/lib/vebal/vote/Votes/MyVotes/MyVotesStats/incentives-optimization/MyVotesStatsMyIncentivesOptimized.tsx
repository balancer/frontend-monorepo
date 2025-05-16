import { Button, HStack, Skeleton, Text, Stack, Tooltip } from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { MagicStickIcon } from '@repo/lib/shared/components/icons/MagicStickIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '../shared/MyVotesStatsCard'
import { useVeBALIncentives } from '../useVeBALIncentives'
import { useVebalUserData } from '@bal/lib/vebal/useVebalUserData'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import NextLink from 'next/link'
import { getVeBalManagePath } from '@bal/lib/vebal/vebal-navigation'
import { areAllVotesTimelocked, useIncentivesOptimized } from './useIncentivesOptimized'
import { canReceiveIncentives, useBlacklistedVotes } from '../../incentivesBlacklist'
import { useVotes } from '../../../VotesProvider'
import { useMyVotes } from '../../MyVotesProvider'
import { useTotalVotes } from '@bal/lib/vebal/vote/useTotalVotes'
import { useVebalLockInfo } from '@bal/lib/vebal/useVebalLockInfo'
import { useLastUserSlope } from '@bal/lib/vebal/vote/useVeBALBalance'
import { calculateVotingPower } from '../../myVotes.helpers'
import { IncentivesOptimizedTooltip } from './IncentivesOptimizedTooltip'
import { useVeBALPool } from '../useVeBALPool'
import {
  GqlPoolAprItem,
  GqlPoolAprItemType,
  GqlPoolStakingType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { getStakedBalance } from '@repo/lib/modules/pool/user-balance.helpers'
import { Pool } from '@repo/lib/modules/pool/pool.types'

export function MyVotesStatsMyIncentivesOptimized() {
  const { toCurrency } = useCurrency()
  const { isConnected, userAddress } = useUserAccount()
  const { isLoading: vebalUserDataLoading, noVeBALBalance } = useVebalUserData()

  const { pool, poolIsLoading } = useVeBALPool(userAddress)
  const aprItems = pool?.dynamicData.aprItems as GqlPoolAprItem[]
  const lockingApr = aprItems?.find(item => item.type === GqlPoolAprItemType.Locking)?.apr || 0
  const balance = pool ? getStakedBalance(pool as Pool, GqlPoolStakingType.Vebal) : undefined
  const protocolRevenueShare = balance ? balance.balanceUsd * lockingApr : 0

  const { incentives, incentivesAreLoading } = useVeBALIncentives(userAddress)

  const { totalVotes, totalVotesLoading } = useTotalVotes()
  const { mainnetLockedInfo, isLoading: lockInfoLoading } = useVebalLockInfo()
  const lockEnd = mainnetLockedInfo.lockedEndDate
  const { slope, isLoading: slopeLoading } = useLastUserSlope(userAddress)
  const { loading: votesLoading, votingPools, toggleVotingPool, isVotedPool } = useVotes()
  const { loading: myVotesLoading, myVotes, onEditVotesChange, totalInfo } = useMyVotes()
  const { isLoading: blacklistedVotesLoading, blacklistedVotes } = useBlacklistedVotes(votingPools)
  const inputsLoading =
    totalVotesLoading ||
    lockInfoLoading ||
    slopeLoading ||
    votesLoading ||
    myVotesLoading ||
    blacklistedVotesLoading

  const {
    isLoading: optimizationLoading,
    totalIncentives: optimizedRewardValue,
    votes: optimizedVotes,
  } = useIncentivesOptimized(
    votingPools,
    myVotes,
    calculateVotingPower(slope, lockEnd).shiftedBy(18),
    bn(totalVotes),
    blacklistedVotes,
    inputsLoading
  )

  const headerText =
    !isConnected || noVeBALBalance || !canReceiveIncentives(userAddress)
      ? 'Voting incentives APR (average)'
      : 'My optimized vote incentives (1w)'

  const isLoading =
    incentivesAreLoading || vebalUserDataLoading || optimizationLoading || poolIsLoading

  const applyOptimizedVotes = () => {
    optimizedVotes.forEach(optimizedVote => {
      const vote = votingPools.find(vote => vote.gauge.address === optimizedVote.gaugeAddress)
      if (vote) {
        if (!isVotedPool(vote)) toggleVotingPool(vote)
        onEditVotesChange(vote.id, bn(optimizedVote.votePrct).times(10000).toString())
      }
    })
  }

  const allVotesTimelocked = areAllVotesTimelocked(myVotes)
  const votesAlreadyOptimized = totalInfo.totalRewardValue.toNumber() === optimizedRewardValue
  const disabledButton = !canReceiveIncentives(userAddress) || votesAlreadyOptimized

  return (
    <MyVotesStatsCard
      headerText={headerText}
      leftContent={
        isLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : !isConnected || noVeBALBalance || !canReceiveIncentives(userAddress) ? (
          <Text fontSize="lg" fontWeight={700} variant="special">
            {incentives.voting ? fNum('feePercent', incentives.voting) : <>&mdash;</>}
          </Text>
        ) : (
          <HStack spacing="xs">
            <Text fontSize="lg" fontWeight={700} variant="special">
              {optimizedRewardValue ? (
                toCurrency(optimizedRewardValue, { abbreviated: false })
              ) : (
                <>&mdash;</>
              )}
            </Text>
            <IncentivesOptimizedTooltip
              protocolRevenueShare={protocolRevenueShare}
              totalIncentives={optimizedRewardValue}
            />
          </HStack>
        )
      }
      rightContent={
        isLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : isConnected && noVeBALBalance ? (
          <Button
            as={NextLink}
            href={getVeBalManagePath('lock', 'vote')}
            size="sm"
            variant="primary"
          >
            Get veBAL
          </Button>
        ) : isConnected ? (
          <Tooltip
            bg="background.base"
            color="font.secondary"
            isDisabled={!allVotesTimelocked}
            label="All your votes are timelocked, so you can't apply any new vote combinations"
          >
            <Stack>
              <Button
                disabled={disabledButton}
                onClick={() => applyOptimizedVotes()}
                size="sm"
                variant={disabledButton ? 'outline' : 'primary'}
              >
                <HStack spacing="xs">
                  <MagicStickIcon />
                  <Text color="font.dark" fontSize="sm" fontWeight="700">
                    {votesAlreadyOptimized && !allVotesTimelocked ? 'Applied' : 'Apply'}
                  </Text>
                </HStack>
              </Button>
            </Stack>
          </Tooltip>
        ) : (
          <Stack>
            <ConnectWallet size="sm" variant="primary" />
          </Stack>
        )
      }
      variant="special"
    />
  )
}
