import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { isZero } from '@repo/lib/shared/utils/numbers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { canReceiveIncentives } from '../incentivesBlacklist'

export function MyVotesStatsAverageReward() {
  const { userAddress } = useUserAccount()
  const { toCurrency } = useCurrency()
  const { totalInfo, loading } = useMyVotes()

  return (
    <MyVotesStatsCard
      headerText="Average reward (Bribes/veBAL)"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : !isZero(totalInfo.averageRewardPerVote) && canReceiveIncentives(userAddress) ? (
          <HStack spacing="sm">
            <Text color="font.maxContrast" fontSize="lg" fontWeight={700}>
              {toCurrency(totalInfo.averageRewardPerVote, {
                abbreviated: false,
                forceThreeDecimals: true,
              })}
            </Text>
            {totalInfo.averageRewardPerVoteGain && (
              <GainBadge gain={totalInfo.averageRewardPerVoteGain} />
            )}
          </HStack>
        ) : (
          <>&mdash;</>
        )
      }
    />
  )
}
