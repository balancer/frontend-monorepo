import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { getVotesState } from '@repo/lib/modules/vebal/vote/vote.helpers'
import { HStack } from '@chakra-ui/react'
import { VoteCapTooltip } from '@repo/lib/modules/vebal/vote/VoteCapTooltip'
import { VoteRateTooltip } from '@repo/lib/modules/vebal/vote/VoteRateTooltip'
import { bn } from '@repo/lib/shared/utils/numbers'
import { isVebalPool } from '@repo/lib/modules/pool/pool.helpers'

function getRelativeWeightCap(relativeWeightCap: string | undefined | null, poolId: string) {
  if (isVebalPool(poolId)) {
    return 0.1
  }

  return !relativeWeightCap || relativeWeightCap === '1' ? 0 : Number(relativeWeightCap)
}

interface Props {
  vote: VotingPoolWithData
}

export function VoteListVotesCell({ vote }: Props) {
  const relativeWeightCap = getRelativeWeightCap(vote.gauge.relativeWeightCap, vote.id)
  const votes = vote.gaugeVotes?.votes
    ? bn(vote.gaugeVotes.votes).shiftedBy(-18).toNumber()
    : undefined
  const votesNextPeriod = vote.gaugeVotes?.votesNextPeriod
    ? bn(vote.gaugeVotes.votesNextPeriod).shiftedBy(-18).toNumber()
    : undefined

  const votesState = getVotesState(relativeWeightCap, votesNextPeriod ?? 0)

  return (
    <HStack spacing="xs">
      {relativeWeightCap !== 0 ? (
        <VoteCapTooltip relativeWeightCap={relativeWeightCap} votesState={votesState} />
      ) : undefined}
      <VoteRateTooltip
        votesShare={votes}
        votesShareNextWeek={votesNextPeriod}
        votesState={votesState}
      />
    </HStack>
  )
}
