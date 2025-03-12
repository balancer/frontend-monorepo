import { HStack, Skeleton, Text } from '@chakra-ui/react'
import React from 'react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { useMyVotes } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesProvider'

interface Props {
  myVebalBalance: number | undefined
  loading: boolean
}

export function MyVotesStatsAverageReward({ myVebalBalance, loading }: Props) {
  const { toCurrency } = useCurrency()
  const { totalInfo } = useMyVotes()

  return (
    <MyVotesStatsCard
      headerText="Average reward (Bribes/veBAL)"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : myVebalBalance && totalInfo.averageRewardPerVote ? (
          <HStack spacing="xs">
            <Text color="font.maxContrast" fontSize="lg" fontWeight={700}>
              {toCurrency(totalInfo.averageRewardPerVote, { abbreviated: false })}
            </Text>
            {totalInfo.averageRewardPerVoteGain && (
              <GainBadge gain={totalInfo.averageRewardPerVoteGain} />
            )}
          </HStack>
        ) : undefined
      }
    />
  )
}
