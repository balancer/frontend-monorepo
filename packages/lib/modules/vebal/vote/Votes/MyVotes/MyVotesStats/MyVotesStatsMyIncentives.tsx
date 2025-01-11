import { HStack, Skeleton, Text } from '@chakra-ui/react'
import React from 'react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { MyIncentivesAprTooltip } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyIncentivesAprTooltip'

interface Props {
  myVebalBalance: number | undefined
  loading: boolean
}

export function MyVotesStatsMyIncentives({ myVebalBalance, loading }: Props) {
  const { toCurrency } = useCurrency()

  const gain = 0.034 // fix: (votes) provide real value
  const rewardValue = 80.08 // fix: (votes) provide real value
  const totalWithEdits = '154' // fix: (votes) provide real value

  return (
    <MyVotesStatsCard
      headerText="My incentives (1w)"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : myVebalBalance ? (
          <HStack spacing="xs">
            <Text color="font.maxContrast" fontSize="lg" fontWeight={700}>
              {toCurrency(rewardValue, { abbreviated: false })}
            </Text>
            {gain && <GainBadge gain={gain} />}
            <MyIncentivesAprTooltip totalWithEdits={totalWithEdits} />
          </HStack>
        ) : undefined
      }
    />
  )
}
