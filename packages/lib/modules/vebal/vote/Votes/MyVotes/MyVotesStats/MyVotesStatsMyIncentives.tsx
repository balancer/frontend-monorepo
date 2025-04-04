import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { MyIncentivesAprTooltip } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyIncentivesAprTooltip'
import { useMyVotes } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesProvider'

interface Props {
  myVebalBalance: number | undefined
  loading: boolean
}

export function MyVotesStatsMyIncentives({ myVebalBalance, loading }: Props) {
  const { toCurrency } = useCurrency()
  const { totalInfo } = useMyVotes()

  return (
    <MyVotesStatsCard
      headerText="My incentives (1w)"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : myVebalBalance && totalInfo.totalRewardValue ? (
          <HStack spacing="xs">
            <Text color="font.maxContrast" fontSize="lg" fontWeight={700}>
              {toCurrency(totalInfo.totalRewardValue, { abbreviated: false })}
            </Text>
            {totalInfo.totalRewardValueGain && <GainBadge gain={totalInfo.totalRewardValueGain} />}
            <MyIncentivesAprTooltip
              totalBeforeVoteEdits={totalInfo.prevTotalRewardValue}
              totalWithVoteEdits={totalInfo.totalRewardValue}
            />
          </HStack>
        ) : undefined
      }
    />
  )
}
