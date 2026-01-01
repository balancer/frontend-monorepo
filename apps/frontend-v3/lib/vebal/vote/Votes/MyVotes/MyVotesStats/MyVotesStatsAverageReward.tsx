import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { GainBadge } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { isZero } from '@repo/lib/shared/utils/numbers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { canReceiveIncentives } from '../incentivesBlacklist'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'

export function MyVotesStatsAverageReward() {
  const { userAddress } = useUserAccount()
  const { toCurrency } = useCurrency()
  const { totalInfo, loading } = useMyVotes()

  return (
    <MyVotesStatsCard
      headerText={
        <TooltipWithTouch
          label="The amount of bribes you could earn on Stake DAO for the next period per veBAL vote. Stake DAO is an unaffiliated 3rd party vote market."
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
            My average reward (Bribes/veBAL)
          </Text>
        </TooltipWithTouch>
      }
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
