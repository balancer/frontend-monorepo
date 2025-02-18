import { HStack, Skeleton, Text } from '@chakra-ui/react'
import React from 'react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'

interface Props {
  myVebalBalance: number | undefined
  loading: boolean
}

export function MyVotesStatsAverageReward({ myVebalBalance, loading }: Props) {
  const { toCurrency } = useCurrency()

  const gain = -0.015 // fix: (votes) provide real value
  const averageReward = 0.102 // fix: (votes) provide real value

  return (
    <MyVotesStatsCard
      headerText="Average reward (Bribes/veBAL)"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : myVebalBalance ? (
          <HStack spacing="xs">
            <Text color="font.maxContrast" fontSize="lg" fontWeight={700}>
              {toCurrency(averageReward, { abbreviated: false })}
            </Text>
            {gain && <GainBadge gain={gain} />}
          </HStack>
        ) : undefined
      }
    />
  )
}
