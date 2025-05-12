import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { MyIncentivesTooltip } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyIncentivesTooltip'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { isZero } from '@repo/lib/shared/utils/numbers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { canReceiveIncentives } from '../incentivesBlacklist'

export function MyVotesStatsMyIncentives() {
  const { userAddress } = useUserAccount()
  const { toCurrency } = useCurrency()
  const { totalInfo, loading } = useMyVotes()

  return (
    <MyVotesStatsCard
      headerText="My potential bribes (1w)"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : !isZero(totalInfo.totalRewardValue) && canReceiveIncentives(userAddress) ? (
          <HStack spacing="sm">
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
