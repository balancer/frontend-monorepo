'use client'

import {
  Alert,
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
  VStack } from '@chakra-ui/react';
import { MyVotesTable } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesTable/MyVotesTable'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { MyVotesStatsMyVebal } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsMyVebal'
import { MyVotesStatsAverageReward } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsAverageReward'
import { MyVotesStatsMyIncentives } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsMyIncentives'
import { MyVotesStatsMyIncentivesOptimized } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/incentives-optimization/MyVotesStatsMyIncentivesOptimized'
import { useDisclosure } from '@chakra-ui/react'
import { MyVotesHintModal } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesHintModal'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { WEIGHT_VOTE_DELAY } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { oneDayInMs } from '@repo/lib/shared/utils/time'
import { useVotes } from '@bal/lib/vebal/vote/Votes/VotesProvider'
import { useVebalUserData } from '@bal/lib/vebal/useVebalUserData'
import { AlertTriangle } from 'react-feather'
import NextLink from 'next/link'
import { getVeBalManagePath } from '../../../vebal-navigation'

export function MyVotes() {
  const { hasAllVotingPowerTimeLocked, vebalIsExpired, vebalLockTooShort } = useVotes()
  const {
    sortedMyVotes,
    loading: myVotesLoading,
    hasExpiredGauges,
    hasNewVotes,
    hasUsablePools } = useMyVotes()
  const { open, onOpen, onClose } = useDisclosure()
  const { isConnected } = useUserAccount()

  const { isLoading: vebalUserDataLoading, veBALBalance, noVeBALBalance } = useVebalUserData()

  const loading = myVotesLoading || vebalUserDataLoading

  return (
    <VStack align="start" gap="md" w="full">
      <HStack alignItems="baseline" justifyContent="space-between" w="full">
        <Heading
          as="h2"
          id="my-votes"
          pb="0.5"
          position="relative"
          size="h4"
          top="6px"
          variant="special"
        >
          My votes
        </Heading>
        <Button
          _hover={{ color: 'font.linkHover', bg: 'background.level3' }}
          color="font.link"
          onClick={onOpen}
          position="relative"
          right="-8px"
          top="4px"
          variant="ghost"
        >
          How it works?
        </Button>
      </HStack>
      <MyVotesHintModal open={open} onClose={onClose} />
      {isConnected && (
        <>
          {vebalIsExpired ? (
            <GridItem w="full">
              <Alert.Root status="error" variant="WideOnDesktop">
                <Alert.Indicator asChild><AlertTriangle /></Alert.Indicator>
                <Stack
                  alignItems="baseline"
                  direction={{ base: 'column', lg: 'row' }}
                  gap={{ base: '0', lg: 'sm' }}
                >
                  <Alert.Title>{`You can't vote due to expired veBAL`}</Alert.Title>
                  <Alert.Description>
                    Voting requires veBAL.{' '}
                    <Box color="font.dark" textDecoration="underline" asChild><NextLink href="/vebal/manage">Extend or relock
                                          </NextLink></Box>{' '}
                    your B-80BAL-20-WETH to replenish your veBAL.
                  </Alert.Description>
                </Stack>
              </Alert.Root>
            </GridItem>
          ) : !loading && noVeBALBalance ? (
            <GridItem w="full">
              <Alert.Root status="warning" variant="WideOnDesktop">
                <Alert.Indicator asChild><AlertTriangle /></Alert.Indicator>
                <Stack
                  alignItems="baseline"
                  direction={{ base: 'column', lg: 'row' }}
                  gap={{ base: '0', lg: 'sm' }}
                >
                  <Alert.Title>You need some veBAL to vote on gauges</Alert.Title>
                  <Alert.Description>
                    {' '}
                    Get veBAL by locking up LP tokens from the{' '}
                    <Box color="font.dark" textDecoration="underline" asChild><NextLink
                      href="/pools/ethereum/v2/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014">80% BAL / 20% WETH pool
                                          </NextLink></Box>
                    .
                  </Alert.Description>
                </Stack>
              </Alert.Root>
            </GridItem>
          ) : null}
        </>
      )}
      <Grid gap="md" mb="100px" templateColumns="repeat(4, 1fr)" templateRows="auto 1fr" w="full">
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyVebal loading={loading} myVebalBalance={veBALBalance} />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyIncentives />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsAverageReward />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyIncentivesOptimized />
        </GridItem>

        {isConnected && (
          <>
            {!vebalIsExpired && !noVeBALBalance && (
              <>
                {hasAllVotingPowerTimeLocked && (
                  <GridItem colSpan={4} w="full">
                    <Alert.Root status="warning" variant="WideOnDesktop">
                      <Alert.Indicator asChild><AlertTriangle /></Alert.Indicator>
                      <Stack
                        alignItems="baseline"
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: '0', lg: 'sm' }}
                      >
                        <Alert.Title>All your votes are timelocked</Alert.Title>
                        <Alert.Description>
                          {`Once you vote on a pool, your vote is fixed for ${WEIGHT_VOTE_DELAY / oneDayInMs} days.`}
                        </Alert.Description>
                      </Stack>
                    </Alert.Root>
                  </GridItem>
                )}

                {vebalLockTooShort && (
                  <GridItem colSpan={4} w="full">
                    <Alert.Root status="warning" variant="WideOnDesktop">
                      <Alert.Indicator asChild><AlertTriangle /></Alert.Indicator>
                      <Stack
                        alignItems="baseline"
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: '0', lg: 'sm' }}
                      >
                        <Alert.Title>{`You can't vote since your veBAL expires before the next vote period`}</Alert.Title>
                        <Alert.Description>
                          Gauge voting requires your veBAL to be locked for 7+ days.{' '}
                          <Text color="font.dark" textDecoration="underline" asChild><NextLink href={getVeBalManagePath('extend', 'vote')}>Extend your lock
                                                      </NextLink></Text>{' '}
                          to vote.
                        </Alert.Description>
                      </Stack>
                    </Alert.Root>
                  </GridItem>
                )}

                {hasExpiredGauges && (
                  <GridItem colSpan={4} w="full">
                    <Alert.Root status="warning" variant="WideOnDesktop">
                      <Alert.Indicator asChild><AlertTriangle /></Alert.Indicator>
                      <Stack
                        alignItems="baseline"
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: '0', lg: 'sm' }}
                      >
                        <Alert.Title>You have votes on an expired pool gauge</Alert.Title>
                        <Alert.Description>Reallocate these to avoid wasting votes</Alert.Description>
                      </Stack>
                    </Alert.Root>
                  </GridItem>
                )}

                {hasNewVotes && hasUsablePools && (
                  <GridItem colSpan={4} w="full">
                    <Alert.Root status="warning">
                      <Alert.Indicator asChild><AlertTriangle /></Alert.Indicator>
                      <Stack alignItems="baseline" gap="0">
                        <Alert.Title>Resubmit your votes to use your full voting power</Alert.Title>
                        <Alert.Description fontSize="sm">
                          Votes are set at the time you cast them. Since you've added more veBAL
                          afterward, that extra voting power is not being fully utilized.
                        </Alert.Description>
                      </Stack>
                    </Alert.Root>
                  </GridItem>
                )}
              </>
            )}
          </>
        )}

        <GridItem colSpan={4} mt="xs">
          <MyVotesTable
            loading={myVotesLoading}
            myVotes={sortedMyVotes}
            noVeBALBalance={noVeBALBalance}
          />
        </GridItem>
      </Grid>
    </VStack>
  );
}
