import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { MyIncentivesTooltip } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyIncentivesTooltip'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { isZero } from '@repo/lib/shared/utils/numbers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { canReceiveIncentives } from '../incentivesBlacklist'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'

export function MyVotesStatsMyIncentives() {
  const { userAddress } = useUserAccount()
  const { toCurrency } = useCurrency()
  const { totalInfo, loading } = useMyVotes()

  return (
    <MyVotesStatsCard
      headerText={
        <TooltipWithTouch
          label="The extra incentives you could earn from bribes on Votemarket, based on your voting choices. Votemarket is an unaffiliated 3rd party vote market. Note: This doesn't include bribes from other vote markets like Paladin"
          placement="top"
        >
          <Text
            _after={{
              borderBottom: '1px dotted',
              borderColor: 'currentColor',
              bottom: '-2px',
              content: '""',
              left: 0,
              opacity: 0.5,
              position: 'absolute',
              width: '100%',
            }}
            fontSize="sm"
            position="relative"
            variant="secondary"
          >
            My potential bribes (1w)
          </Text>
        </TooltipWithTouch>
      }
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : !isZero(totalInfo.totalRewardValue) && canReceiveIncentives(userAddress) ? (
          <HStack spacing="xs">
            <Text color="font.maxContrast" fontSize="lg" fontWeight={700}>
              {toCurrency(totalInfo.totalRewardValue, { abbreviated: false })}
            </Text>
            <MyIncentivesTooltip />
            {totalInfo.totalRewardValueGain && <GainBadge gain={totalInfo.totalRewardValueGain} />}
          </HStack>
        ) : (
          <>&mdash;</>
        )
      }
    />
  )
}
