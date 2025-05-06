import { VStack, Card, HStack, Text, Divider, Box, Badge } from '@chakra-ui/react'
import { VotingListTokenPills } from '@repo/lib/modules/pool/PoolList/PoolListTokenPills'
import { SubmittingVote } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { fNum, bn } from '@repo/lib/shared/utils/numbers'
import {
  bpsToPercentage,
  votingTimeLockedEndDate,
} from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { MyVotesTotalInfo } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.types'
import { VoteWeight } from '@bal/lib/vebal/vote/Votes/MyVotes/VoteWeight'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { VotesChunksAllocation } from '@bal/lib/vebal/vote/Votes/MyVotes/actions/submit/useSubmittingVotes'
import { AlertTriangle } from 'react-feather'
import { CHUNK_SIZE } from '@bal/lib/vebal/vote/Votes/MyVotes/actions/submit/useSubmitVotesSteps'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { GainBadge } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/shared/GainBadge'
import { MyIncentivesTooltip } from '../../../MyVotesStats/shared/MyIncentivesTooltip'

interface Props {
  submittingVotes: SubmittingVote[]
  timeLockedVotes: SubmittingVote[]
  totalInfo: MyVotesTotalInfo
  previousChunksAllocation: VotesChunksAllocation | undefined
  nextChunksAllocation: VotesChunksAllocation | undefined
  isPoolGaugeExpired?: (votingPool: VotingPoolWithData) => boolean
}

export function SubmitVotesPreview({
  submittingVotes,
  timeLockedVotes,
  totalInfo,
  previousChunksAllocation,
  nextChunksAllocation,
  isPoolGaugeExpired,
}: Props) {
  const { toCurrency } = useCurrency()

  const unallocatedVotes = totalInfo.unallocatedVotes || bn(0)
  const editVotes = totalInfo.editVotes || bn(0)

  return (
    <VStack spacing="md" w="full">
      <Card p="0" variant="subSection">
        <VStack spacing="0" w="full">
          <HStack justifyContent="space-between" p="md" spacing="sm" w="full">
            <Text fontSize="sm" fontWeight={700} variant="secondary">
              Pool gauge
            </Text>
            <Text fontSize="sm" fontWeight={700} variant="secondary">
              Votes
            </Text>
          </HStack>

          {submittingVotes.length > 0 && (
            <>
              <Divider />

              <VStack p="md" spacing="sm" w="full">
                {submittingVotes.map(({ vote, weight }) => {
                  const isExpired = isPoolGaugeExpired?.(vote)

                  return (
                    <HStack justifyContent="space-between" key={vote.id} spacing="sm" w="full">
                      <HStack spacing="xs">
                        <NetworkIcon chain={vote.chain} size={6} />

                        <VotingListTokenPills
                          h={['32px', '36px']}
                          iconSize={20}
                          nameSize="sm"
                          p={['xxs', 'sm']}
                          pr={[1.5, 'ms']}
                          vote={vote}
                        />

                        {isExpired && (
                          <Badge
                            background="red.400"
                            color="font.dark"
                            fontSize="xs"
                            textTransform="unset"
                            userSelect="none"
                          >
                            Expired
                          </Badge>
                        )}
                      </HStack>
                      <VoteWeight variant="primary" weight={bn(weight)} />
                    </HStack>
                  )
                })}
              </VStack>
            </>
          )}

          {timeLockedVotes.length > 0 && (
            <>
              <Divider />

              <VStack p="md" spacing="sm" w="full">
                {timeLockedVotes.map(({ vote, weight }) => {
                  return (
                    <HStack justifyContent="space-between" key={vote.id} spacing="sm" w="full">
                      <HStack spacing="xs">
                        <NetworkIcon chain={vote.chain} size={6} />

                        <VotingListTokenPills
                          h={['32px', '36px']}
                          iconSize={20}
                          nameSize="sm"
                          p={['xxs', 'sm']}
                          pr={[1.5, 'ms']}
                          vote={vote}
                        />
                      </HStack>
                      <VoteWeight
                        timeLocked
                        timeLockedEndDate={votingTimeLockedEndDate(
                          vote.gaugeVotes?.lastUserVoteTime ?? 0
                        )}
                        variant="secondary"
                        weight={bn(weight)}
                      />
                    </HStack>
                  )
                })}
              </VStack>
            </>
          )}

          {totalInfo.unallocatedVotes && (
            <>
              <Divider />

              <HStack justifyContent="space-between" p="md" spacing="md" w="full">
                <Text fontSize="sm" fontWeight={700} variant="secondary">
                  Unallocated votes
                </Text>
                <Text variant="secondary">{fNum('apr', bpsToPercentage(unallocatedVotes))}</Text>
              </HStack>
            </>
          )}

          {previousChunksAllocation && (
            <>
              <Divider />

              <HStack justifyContent="space-between" p="md" spacing="md" w="full">
                <HStack spacing="md">
                  <Box color="font.warning">
                    <AlertTriangle size={24} />
                  </Box>
                  <Text fontSize="sm" fontWeight={700} variant="secondary">
                    Votes confirmed in previous steps
                  </Text>
                </HStack>
                <Text variant="secondary">
                  {fNum('apr', bpsToPercentage(previousChunksAllocation.weight))}
                </Text>
              </HStack>
            </>
          )}

          {nextChunksAllocation && (
            <>
              <Divider />

              <HStack justifyContent="space-between" p="md" spacing="md" w="full">
                <HStack spacing="md">
                  <Box color="font.warning">
                    <AlertTriangle size={24} />
                  </Box>
                  <Text fontSize="sm" fontWeight={700} variant="secondary">
                    {nextChunksAllocation.count === 1
                      ? `Votes to allocate in the next transaction`
                      : `Votes to allocate in the next ${nextChunksAllocation.count} transactions`}{' '}
                    <br />
                    (Only {CHUNK_SIZE} votes can be processed at a time)
                  </Text>
                </HStack>
                <Text variant="secondary">
                  {fNum('apr', bpsToPercentage(nextChunksAllocation.weight))}
                </Text>
              </HStack>
            </>
          )}

          <Divider />

          <HStack justifyContent="space-between" p="md" spacing="sm" w="full">
            <Text fontWeight={700}>Total</Text>
            <Text fontWeight={700}>{fNum('apr', bpsToPercentage(editVotes))}</Text>
          </HStack>
        </VStack>
      </Card>

      <HStack alignItems="stretch" spacing="sm" w="full">
        <Card flex="1" variant="subSection">
          <Text variant="special">Potential incentives (1w)</Text>
          <HStack spacing="xs">
            <Text fontSize="lg" fontWeight={700} variant="special">
              {totalInfo.totalRewardValue !== undefined ? (
                toCurrency(totalInfo.totalRewardValue, { abbreviated: false })
              ) : (
                <>&mdash;</>
              )}
            </Text>
            {totalInfo.totalRewardValueGain && <GainBadge gain={totalInfo.totalRewardValueGain} />}
            <MyIncentivesTooltip />
          </HStack>
        </Card>

        {totalInfo.averageRewardPerVote !== undefined && (
          <Card flex="1" variant="subSection">
            <Text>Ave. Reward (Bribes/veBAL)</Text>
            <Text fontSize="lg" fontWeight={700}>
              {toCurrency(totalInfo.averageRewardPerVote, { abbreviated: false })}
            </Text>
          </Card>
        )}
      </HStack>
    </VStack>
  )
}
