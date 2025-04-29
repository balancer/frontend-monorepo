import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { isZero } from '@repo/lib/shared/utils/numbers'

export function MyVotesStatsAverageReward() {
  const { toCurrency } = useCurrency()
  const { totalInfo, loading } = useMyVotes()

  return (
    <MyVotesStatsCard
      headerText="Average reward (Bribes/veBAL)"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : !isZero(totalInfo.averageRewardPerVote) ? (
          <HStack spacing="xs">
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
