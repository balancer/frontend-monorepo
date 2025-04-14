import {
  Box,
  Button,
  Grid,
  GridItem,
  GridProps,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Skeleton,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import Link from 'next/link'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { VotingListTokenPills } from '@repo/lib/modules/pool/PoolList/PoolListTokenPills'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { ArrowUpIcon } from '@repo/lib/shared/components/icons/ArrowUpIcon'
import { useVoteList } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import { VoteListVotesCell } from '@repo/lib/modules/vebal/vote/VoteList/VoteListTable/VoteListVotesCell'
import { VoteExpiredTooltip } from '@repo/lib/modules/vebal/vote/VoteExpiredTooltip'
import { useVotes } from '@repo/lib/modules/vebal/vote/Votes/VotesProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { PoolListTableDetailsCell } from '@repo/lib/modules/pool/PoolList/PoolListTable/PoolListTableDetailsCell'
import { voteToPool } from '@repo/lib/modules/vebal/vote/vote.helpers'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

interface Props extends GridProps {
  vote: VotingPoolWithData
  keyValue: string | number
}

export function VoteListTableRow({ vote, keyValue, ...rest }: Props) {
  const { isConnected } = useUserAccount()
  const { toCurrency } = useCurrency()
  const { hasAllVotingPowerTimeLocked, allowSelectVotingPools } = useVotes()
  const { toggleVotingPool, isSelectedPool, isVotedPool } = useVotes()

  const selected = isSelectedPool(vote)
  const voted = isVotedPool(vote)

  const { incentivesAreLoading, gaugeVotesIsLoading } = useVoteList()

  const isDisabled = !isConnected || hasAllVotingPowerTimeLocked || !allowSelectVotingPools

  const disabledReason = isConnected
    ? 'Get veBAL to select and vote on pool gauges'
    : 'Connect your wallet to select and vote on pool gauges.'

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
          <GridItem>
            <NetworkIcon chain={vote.chain} size={6} />
          </GridItem>
          <GridItem>
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
                {vote.gauge.isKilled && <VoteExpiredTooltip usePortal />}
                <Box color="font.secondary">
                  <ArrowUpIcon transform="rotate(90)" />
                </Box>
              </HStack>
            </Link>
          </GridItem>
          <GridItem>
            <PoolListTableDetailsCell pool={voteToPool(vote, getToken)} />
          </GridItem>
          <GridItem justifySelf="end" textAlign="right">
            {incentivesAreLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : vote.votingIncentive ? (
              <Text>{toCurrency(vote.votingIncentive.totalValue, { abbreviated: false })}</Text>
            ) : (
              <Popover trigger="hover">
                <PopoverTrigger>
                  <Text color="font.warning" zIndex={1}>
                    &mdash;
                  </Text>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent maxW="300px" p="sm" w="auto">
                    <Text fontSize="sm" textAlign="left" variant="secondary">
                      There is currently no bribe data on this pool from Hidden Hand
                    </Text>
                  </PopoverContent>
                </Portal>
              </Popover>
            )}
          </GridItem>
          <GridItem justifySelf="end" textAlign="right">
            {incentivesAreLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : vote.votingIncentive ? (
              <Text>{toCurrency(vote.votingIncentive.valuePerVote, { abbreviated: false })}</Text>
            ) : (
              <Popover trigger="hover">
                <PopoverTrigger>
                  <Text color="font.warning">&mdash;</Text>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent maxW="300px" p="sm" w="auto">
                    <Text fontSize="sm" textAlign="left" variant="secondary">
                      There is currently no bribe data on this pool from Hidden Hand
                    </Text>
                  </PopoverContent>
                </Portal>
              </Popover>
            )}
          </GridItem>
          <GridItem justifySelf="end" textAlign="right">
            {gaugeVotesIsLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : (
              <VoteListVotesCell vote={vote} />
            )}
          </GridItem>
          <GridItem justifySelf="end">
            {vote.gauge.isKilled || voted ? (
              <Button
                color="font.secondary"
                fontSize="sm"
                fontWeight="700"
                isDisabled
                variant="outline"
                w="80px"
              >
                {vote.gauge.isKilled ? 'Expired' : 'Voted'}
              </Button>
            ) : (
              <Tooltip isDisabled={!isDisabled} label={disabledReason}>
                <Button
                  color={selected ? 'font.secondary' : undefined}
                  fontSize="sm"
                  fontWeight="700"
                  isDisabled={isDisabled}
                  onClick={() => toggleVotingPool(vote)}
                  variant={selected ? 'outline' : 'secondary'}
                  w="80px"
                >
                  {selected ? 'Selected' : 'Select'}
                </Button>
              </Tooltip>
            )}
          </GridItem>
        </Grid>
      </Box>
    </FadeInOnView>
  )
}
