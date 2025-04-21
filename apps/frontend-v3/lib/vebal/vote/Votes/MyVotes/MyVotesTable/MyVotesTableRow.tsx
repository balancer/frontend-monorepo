import {
  Box,
  Grid,
  GridItem,
  GridItemProps,
  GridProps,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useToken,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { VotingListTokenPills } from '@repo/lib/modules/pool/PoolList/PoolListTokenPills'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { ArrowUpIcon } from '@repo/lib/shared/components/icons/ArrowUpIcon'
import { VoteExpiredTooltip } from '@bal/lib/vebal/vote/VoteExpiredTooltip'
import { Trash2 } from 'react-feather'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { VoteWeightInput } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesTable/VoteWeightInput'
import {
  bpsToPercentage,
  calculateMyVoteRewardsValue,
  inputPercentageWeightToBps,
  votingTimeLockedEndDate,
} from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'

import { useVotes } from '@bal/lib/vebal/vote/Votes/VotesProvider'
import { VoteWeight } from '@bal/lib/vebal/vote/Votes/MyVotes/VoteWeight'
import { isVotingTimeLocked } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { useVebalUserData } from '@bal/lib/vebal/useVebalUserData'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

interface Props extends GridProps {
  vote: VotingPoolWithData
  keyValue: string | number
  cellProps: GridItemProps
}

export function MyVotesTableRow({ vote, keyValue, cellProps, ...rest }: Props) {
  const { votedVotesWeights, editVotesWeights, onEditVotesChange } = useMyVotes()
  const {
    isSelectedPool,
    toggleVotingPool,
    allowChangeVotes,
    vebalLockTooShort,
    isPoolGaugeExpired,
    vebalIsExpired,
  } = useVotes()
  const { toCurrency } = useCurrency()

  const isGaugeExpired = isPoolGaugeExpired(vote)

  const editVotes = bpsToPercentage(editVotesWeights[vote.id] ?? 0).multipliedBy(100)

  const removable = isSelectedPool(vote)

  const timeLocked = isVotingTimeLocked(vote.gaugeVotes?.lastUserVoteTime ?? 0)

  const onRemove = () => {
    toggleVotingPool(vote)
  }

  const [fontSecondary] = useToken('colors', ['font.secondary'])

  const { veBALBalance, noVeBALBalance } = useVebalUserData()

  const isDisabled = timeLocked || !allowChangeVotes || (vebalIsExpired ?? true) || isGaugeExpired

  const { getToken } = useTokens()

  return (
    <FadeInOnView>
      <Box
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        px={{ base: '0', sm: 'md' }}
        rounded="md"
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
          <GridItem {...cellProps}>
            <NetworkIcon chain={vote.chain} size={6} />
          </GridItem>
          <GridItem {...cellProps}>
            <Link href={getPoolPath(vote)} target="_blank">
              <HStack>
                <VotingListTokenPills
                  getToken={getToken}
                  h={['32px', '36px']}
                  iconSize={20}
                  p={['xxs', 'sm']}
                  pr={[1.5, 'ms']}
                  vote={vote}
                />
                {isGaugeExpired && <VoteExpiredTooltip usePortal />}
                <Box color="font.secondary">
                  <ArrowUpIcon transform="rotate(90)" />
                </Box>
              </HStack>
            </Link>
          </GridItem>
          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            {vote.votingIncentive ? (
              <Text>
                {toCurrency(
                  calculateMyVoteRewardsValue(
                    votedVotesWeights[vote.id] ?? 0,
                    editVotesWeights[vote.id] ?? 0,
                    vote,
                    veBALBalance
                  ),
                  { abbreviated: false }
                )}
              </Text>
            ) : (
              <Text color="red.400">&mdash;</Text>
            )}
          </GridItem>
          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            {vote.votingIncentive ? (
              <Text>{toCurrency(vote.votingIncentive.valuePerVote, { abbreviated: false })}</Text>
            ) : (
              <Text color="red.400">&mdash;</Text>
            )}
          </GridItem>
          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            <VoteWeight
              isGaugeExpired={isGaugeExpired}
              timeLocked={timeLocked}
              timeLockedEndDate={votingTimeLockedEndDate(vote.gaugeVotes?.lastUserVoteTime ?? 0)}
              variant="primary"
              weight={bn(vote.gaugeVotes?.userVotes || '0')}
            />
          </GridItem>
          <GridItem justifySelf="end" textAlign="right" {...cellProps}>
            <VoteWeightInput
              isDisabled={isDisabled}
              isGaugeExpired={isGaugeExpired}
              isLockExpired={vebalIsExpired}
              isTimeLocked={timeLocked}
              isTooShort={vebalLockTooShort}
              lastVoteTime={vote.gaugeVotes?.lastUserVoteTime}
              max={100}
              min={0}
              noBalance={noVeBALBalance}
              percentage={editVotes.toString()}
              pr="32px"
              setPercentage={value =>
                onEditVotesChange(vote.id, inputPercentageWeightToBps(value).toString())
              }
              step={0.01}
              textAlign="right"
              width="100px"
            />
          </GridItem>
          <GridItem {...cellProps}>
            <VStack align="center" w="full">
              <Tooltip
                isDisabled={removable}
                label="You have an existing vote, so this row cannot be removed from the table. Set it to 0% to reallocate your vote."
              >
                <IconButton
                  aria-label="Remove"
                  icon={<Trash2 color={fontSecondary} height="20px" />}
                  isDisabled={!removable}
                  onClick={onRemove}
                  variant="ghost"
                />
              </Tooltip>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </FadeInOnView>
  )
}
