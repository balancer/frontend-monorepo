'use client'

import {
  Alert,
  Box,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { MyVotesTable } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesTable/MyVotesTable'
import { useMyVotes } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { MyVotesStatsMyVebal } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsMyVebal'
import { MyVotesStatsAverageReward } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsAverageReward'
import { MyVotesStatsMyIncentives } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsMyIncentives'
import { MyVotesStatsMyIncentivesOptimized } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesStats/incentives-optimization/MyVotesStatsMyIncentivesOptimized'
import { useDisclosure } from '@chakra-ui/hooks'
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
  const { hasAllVotingPowerTimeLocked, vebalIsExpired, vebalLockTooShort, shouldResubmitVotes } =
    useVotes()
  const { sortedMyVotes, loading: myVotesLoading, hasExpiredGauges } = useMyVotes()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isConnected } = useUserAccount()

  const { isLoading: vebalUserDataLoading, veBALBalance, noVeBALBalance } = useVebalUserData()

  const loading = myVotesLoading || vebalUserDataLoading

  return (
    <VStack align="start" spacing="md" w="full">
      <HStack alignItems="baseline" justifyContent="space-between" w="full">
        <Heading as="h2" id="my-votes" pb="0.5" size="lg" variant="special">
          My votes
        </Heading>
        <Button
          _hover={{ color: 'font.linkHover' }}
          color="font.link"
          onClick={onOpen}
          position="relative"
          top="4px"
          variant="ghost"
        >
          How it works?
        </Button>
      </HStack>

      <MyVotesHintModal isOpen={isOpen} onClose={onClose} />

      {isConnected && (
        <>
          {vebalIsExpired ? (
            <GridItem w="full">
              <Alert status="error" variant="WideOnDesktop">
                <AlertIcon as={AlertTriangle} />
                <Stack
                  alignItems="baseline"
                  direction={{ base: 'column', lg: 'row' }}
                  gap={{ base: '0', lg: 'sm' }}
                >
                  <AlertTitle>{`You can't vote due to expired veBAL`}</AlertTitle>
                  <AlertDescription>
                    Voting requires veBAL.{' '}
                    <Box
                      as={NextLink}
                      color="font.dark"
                      href="/vebal/manage"
                      textDecoration="underline"
                    >
                      Extend or relock
                    </Box>{' '}
                    your B-80BAL-20-WETH to replenish your veBAL.
                  </AlertDescription>
                </Stack>
              </Alert>
            </GridItem>
          ) : noVeBALBalance ? (
            <GridItem w="full">
              <Alert status="warning" variant="WideOnDesktop">
                <AlertIcon as={AlertTriangle} />
                <Stack
                  alignItems="baseline"
                  direction={{ base: 'column', lg: 'row' }}
                  gap={{ base: '0', lg: 'sm' }}
                >
                  <AlertTitle>You need some veBAL to vote on gauges</AlertTitle>
                  <AlertDescription>
                    {' '}
                    Get veBAL by locking up LP tokens from the{' '}
                    <Box
                      as={NextLink}
                      color="font.dark"
                      href="/pools/ethereum/v2/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014"
                      textDecoration="underline"
                    >
                      80% BAL / 20% WETH pool
                    </Box>
                    .
                  </AlertDescription>
                </Stack>
              </Alert>
            </GridItem>
          ) : null}
        </>
      )}

      <Grid gap="md" templateColumns="repeat(4, 1fr)" templateRows="auto 1fr" w="full">
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyVebal loading={loading} myVebalBalance={veBALBalance} />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsAverageReward />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyIncentives />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyIncentivesOptimized />
        </GridItem>

        {isConnected && (
          <>
            {!vebalIsExpired && !noVeBALBalance && (
              <>
                {hasAllVotingPowerTimeLocked && (
                  <GridItem colSpan={4} mt="md" w="full">
                    <Alert status="warning" variant="WideOnDesktop">
                      <AlertIcon as={AlertTriangle} />
                      <Stack
                        alignItems="baseline"
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: '0', lg: 'sm' }}
                      >
                        <AlertTitle>All your votes are timelocked</AlertTitle>
                        <AlertDescription>
                          {`Once you vote on a pool, your vote is fixed for ${WEIGHT_VOTE_DELAY / oneDayInMs} days.`}
                        </AlertDescription>
                      </Stack>
                    </Alert>
                  </GridItem>
                )}

                {vebalLockTooShort && (
                  <GridItem colSpan={4} mt="md" w="full">
                    <Alert status="warning" variant="WideOnDesktop">
                      <AlertIcon as={AlertTriangle} />
                      <Stack
                        alignItems="baseline"
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: '0', lg: 'sm' }}
                      >
                        <AlertTitle>{`You can't vote since your veBAL expires before the next vote period`}</AlertTitle>
                        <AlertDescription>
                          Gauge voting requires your veBAL to be locked for 7+ days.{' '}
                          <Text
                            as={NextLink}
                            color="font.dark"
                            href={getVeBalManagePath('extend', 'vote')}
                            textDecoration="underline"
                          >
                            Extend your lock
                          </Text>{' '}
                          to vote.
                        </AlertDescription>
                      </Stack>
                    </Alert>
                  </GridItem>
                )}

                {shouldResubmitVotes && (
                  <GridItem colSpan={4} mt="md" w="full">
                    <Alert status="info" variant="WideOnDesktop">
                      <AlertIcon as={AlertTriangle} />
                      <Stack
                        alignItems="baseline"
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: '0', lg: 'sm' }}
                      >
                        <AlertTitle fontSize={{ base: 'sm', xl: 'md' }}>
                          Resubmit your votes to utilize your full voting power
                        </AlertTitle>
                        <AlertDescription fontSize={{ base: 'xs', xl: 'sm' }}>
                          {`Looks like you got more veBAL. Your old votes don't use it.
                          Re-vote now to apply your full veBAL power.`}
                        </AlertDescription>
                      </Stack>
                    </Alert>
                  </GridItem>
                )}

                {hasExpiredGauges && (
                  <GridItem colSpan={4} mt="md" w="full">
                    <Alert status="warning" variant="WideOnDesktop">
                      <AlertIcon as={AlertTriangle} />
                      <Stack
                        alignItems="baseline"
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: '0', lg: 'sm' }}
                      >
                        <AlertTitle>You have votes on an expired pool gauge</AlertTitle>
                        <AlertDescription>Reallocate these to avoid wasting votes</AlertDescription>
                      </Stack>
                    </Alert>
                  </GridItem>
                )}
              </>
            )}
          </>
        )}

        <GridItem colSpan={4}>
          <MyVotesTable
            loading={myVotesLoading}
            myVotes={sortedMyVotes}
            noVeBALBalance={noVeBALBalance}
          />
        </GridItem>
      </Grid>
    </VStack>
  )
}
