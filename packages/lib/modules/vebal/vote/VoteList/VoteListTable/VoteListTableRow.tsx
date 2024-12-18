import { Box, Button, Grid, GridItem, GridProps, HStack, Skeleton, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import { PoolListTokenPills } from '@repo/lib/modules/pool/PoolList/PoolListTokenPills'
import { getPoolPath, getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import { ArrowUpIcon } from '@repo/lib/shared/components/icons/ArrowUpIcon'
import React, { useMemo, useState } from 'react'
import { useVoteList } from '@repo/lib/modules/vebal/vote/VoteList/VoteListProvider'
import { VoteListVotesCell } from '@repo/lib/modules/vebal/vote/VoteList/VoteListTable/VoteListVotesCell'

interface Props extends GridProps {
  vote: VotingPoolWithData
  keyValue: string | number
}

export function VoteListTableRow({ vote, keyValue, ...rest }: Props) {
  const { toCurrency } = useCurrency()

  const [selected, setSelected] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleSelection = (e: React.MouseEvent<HTMLButtonElement>) => {
    // todo: implement selection
    setSelected(v => !v)
  }

  const { votingIncentivesLoading, gaugeVotesIsLoading } = useVoteList()

  const pool = useMemo(
    () => ({
      displayTokens: vote.tokens.map(token => ({ ...token, name: token.symbol })), // fix: no name
      type: vote.type,
      chain: vote.chain,
      poolTokens: [],
      address: vote.address,
      protocolVersion: 3, // fix: no data
      hasAnyAllowedBuffer: false, // fix: no data
      hasErc4626: false, // fix: no data
    }),
    [vote]
  )

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
            <Link
              href={getPoolPath({
                id: vote.id,
                chain: vote.chain,
                type: vote.type,
                protocolVersion: undefined,
              })}
              target="_blank"
            >
              <HStack>
                <PoolListTokenPills
                  h={['32px', '36px']}
                  iconSize={20}
                  p={['xxs', 'sm']}
                  pool={pool}
                  pr={[1.5, 'ms']}
                />
                <Box color="font.secondary">
                  <ArrowUpIcon transform="rotate(90)" />
                </Box>
              </HStack>
            </Link>
          </GridItem>
          <GridItem textAlign="right">
            <Text fontWeight="medium" textAlign="right" textTransform="capitalize">
              {getPoolTypeLabel(vote.type)}
            </Text>
          </GridItem>
          <GridItem justifySelf="end" textAlign="right">
            {votingIncentivesLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : vote.votingIncentive ? (
              <Text>{toCurrency(vote.votingIncentive.totalValue, { abbreviated: false })}</Text>
            ) : (
              <Text color="red.400">&mdash;</Text>
            )}
          </GridItem>
          <GridItem justifySelf="end" textAlign="right">
            {votingIncentivesLoading ? (
              <Skeleton h="20px" w="60px" />
            ) : vote.votingIncentive ? (
              <Text>{toCurrency(vote.votingIncentive.valuePerVote, { abbreviated: false })}</Text>
            ) : (
              <Text color="red.400">&mdash;</Text>
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
            <Button
              color={selected ? 'font.secondary' : undefined}
              fontSize="sm"
              fontWeight="700"
              onClick={toggleSelection}
              variant={selected ? 'outline' : 'secondary'}
              w="80px"
            >
              {selected ? 'Selected' : 'Select'}
            </Button>
          </GridItem>
        </Grid>
      </Box>
    </FadeInOnView>
  )
}
