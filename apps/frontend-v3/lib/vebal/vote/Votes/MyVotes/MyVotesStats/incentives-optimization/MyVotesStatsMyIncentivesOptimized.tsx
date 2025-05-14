import { Button, HStack, Skeleton, Text, Stack } from '@chakra-ui/react'
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
import { useIncentivesOptimized } from './useIncentivesOptimized'
import { canReceiveIncentives, useBlacklistedVotes } from '../../incentivesBlacklist'
import { useVotes } from '../../../VotesProvider'
import { useMyVotes } from '../../MyVotesProvider'
import { useTotalVotes } from '@bal/lib/vebal/vote/useTotalVotes'
import { useVebalLockInfo } from '@bal/lib/vebal/useVebalLockInfo'
import { useLastUserSlope } from '@bal/lib/vebal/vote/useVeBALBalance'
import { calculateVotingPower } from '../../myVotes.helpers'
import { IncentivesOptimizedTooltip } from './IncentivesOptimizedTooltip'

export function MyVotesStatsMyIncentivesOptimized() {
  const { toCurrency } = useCurrency()
  const { isConnected, userAddress } = useUserAccount()
  const { isLoading: vebalUserDataLoading, noVeBALBalance } = useVebalUserData()

  // fix: (votes) add new state when we are able to calculate optimized votes

  // const isApplied = false
  // if (isApplied) {
  //   return {
  //     variant: 'outline',
  //     isDisabled: true,
  //     children: 'Applied',
  //   }
  // }

  const { incentives, incentivesAreLoading } = useVeBALIncentives(userAddress)

  const { totalVotes, totalVotesLoading } = useTotalVotes()
  const { mainnetLockedInfo, isLoading: lockInfoLoading } = useVebalLockInfo()
  const lockEnd = mainnetLockedInfo.lockedEndDate
  const { slope, isLoading: slopeLoading } = useLastUserSlope(userAddress)
  const { loading: votesLoading, votingPools } = useVotes()
  const { loading: myVotesLoading, myVotes } = useMyVotes()
  const { isLoading: blacklistedVotesLoading, blacklistedVotes } = useBlacklistedVotes(votingPools)
  const inputsLoading =
    totalVotesLoading ||
    lockInfoLoading ||
    slopeLoading ||
    votesLoading ||
    myVotesLoading ||
    blacklistedVotesLoading

  const { isLoading: optimizationLoading, totalIncentives: optimizedRewardValue } =
    useIncentivesOptimized(
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

  const isLoading = incentivesAreLoading || vebalUserDataLoading || optimizationLoading

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
              protocolRevenueShare={0}
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
          <Button size="sm" variant="primary">
            <HStack spacing="xs">
              <MagicStickIcon />
              <Text color="font.dark" fontSize="sm" fontWeight="700">
                Coming soon
              </Text>
            </HStack>
          </Button>
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
