import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { MyIncentivesTooltip } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyIncentivesTooltip'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { isZero } from '@repo/lib/shared/utils/numbers'

export function MyVotesStatsMyIncentives() {
  const { toCurrency } = useCurrency()
  const { totalInfo, loading } = useMyVotes()

  return (
    <MyVotesStatsCard
      headerText="My potential bribes (1w)"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : !isZero(totalInfo.totalRewardValue) ? (
          <HStack spacing="xs">
            <Text color="font.maxContrast" fontSize="lg" fontWeight={700}>
              {toCurrency(totalInfo.totalRewardValue, { abbreviated: false })}
            </Text>
            {totalInfo.totalRewardValueGain && <GainBadge gain={totalInfo.totalRewardValueGain} />}
            <MyIncentivesTooltip />
          </HStack>
        ) : (
          <>&mdash;</>
        )
      }
    />
  )
}
