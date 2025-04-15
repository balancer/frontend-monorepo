'use client'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Center,
  Grid,
  GridItem,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { MyVotesTable } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesTable/MyVotesTable'
import { useMyVotes } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { MyVotesStatsMyVebal } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsMyVebal'
import { MyVotesStatsAverageReward } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsAverageReward'
import { MyVotesStatsMyIncentives } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsMyIncentives'
import { MyVotesStatsMyIncentivesOptimized } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/MyVotesStatsMyIncentivesOptimized'
import { useDisclosure } from '@chakra-ui/hooks'
import { MyVotesHintModal } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesHintModal'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { WEIGHT_VOTE_DELAY } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { oneDayInMs } from '@repo/lib/shared/utils/time'
import { useVotes } from '@repo/lib/modules/vebal/vote/Votes/VotesProvider'
import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
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
      <HStack justifyContent="space-between" w="full">
        <Heading as="h2" size="lg" variant="special">
          My votes
        </Heading>
        <Button
          _hover={{ color: 'font.linkHover' }}
          color="font.link"
          onClick={onOpen}
          variant="ghost"
        >
          How it works?
        </Button>
      </HStack>

      <MyVotesHintModal isOpen={isOpen} onClose={onClose} />

      <Grid gap="md" templateColumns="repeat(4, 1fr)" templateRows="auto 1fr" w="full">
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyVebal loading={loading} myVebalBalance={veBALBalance} />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsAverageReward loading={loading} />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyIncentives loading={loading} />
        </GridItem>
        <GridItem colSpan={{ base: 4, md: 2, lg: 1 }}>
          <MyVotesStatsMyIncentivesOptimized />
        </GridItem>

        {vebalIsExpired ? (
          <GridItem colSpan={4}>
            <Alert status="warning">
              <AlertIcon as={AlertTriangle} />
              <HStack alignItems="baseline">
                <AlertTitle>{`You can't vote because your veBAL has expired`}</AlertTitle>
                <AlertDescription>
                  You need some veBAL to vote on gauges. Unlock and relock your B-80BAL-20-WETH to
                  get some veBAL.
                </AlertDescription>
              </HStack>
            </Alert>
          </GridItem>
        ) : noVeBALBalance ? (
          <GridItem colSpan={4}>
            <Alert status="warning">
              <AlertIcon as={AlertTriangle} />
              <HStack alignItems="baseline">
                <AlertTitle>You need some veBAL to vote on gauges</AlertTitle>
                <AlertDescription>
                  Get veBAL by locking up LP tokens from the 80% BAL / 20% WETH pool.
                </AlertDescription>
              </HStack>
            </Alert>
          </GridItem>
        ) : (
          <>
            {hasAllVotingPowerTimeLocked && (
              <GridItem colSpan={4}>
                <Alert status="warning">
                  <AlertIcon as={AlertTriangle} />
                  <HStack alignItems="baseline">
                    <AlertTitle>All your votes are timelocked</AlertTitle>
                    <AlertDescription>
                      {`Once you vote on a pool, your vote is fixed for ${WEIGHT_VOTE_DELAY / oneDayInMs} days.`}
                    </AlertDescription>
                  </HStack>
                </Alert>
              </GridItem>
            )}

            {vebalLockTooShort && (
              <GridItem colSpan={4}>
                <Alert status="warning">
                  <AlertIcon as={AlertTriangle} />
                  <HStack alignItems="baseline">
                    <AlertTitle>{`You can't vote because your veBAL expires soon`}</AlertTitle>
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
                  </HStack>
                </Alert>
              </GridItem>
            )}

            {shouldResubmitVotes && (
              <GridItem colSpan={4}>
                <Alert status="info">
                  <AlertIcon as={AlertTriangle} />
                  <HStack alignItems="baseline">
                    <AlertTitle>Resubmit your votes to utilize your full voting power</AlertTitle>
                    <AlertDescription>
                      {`Looks like you got more veBAL. Your old votes don't use it.
                      Re-vote now to apply your full veBAL power.`}
                    </AlertDescription>
                  </HStack>
                </Alert>
              </GridItem>
            )}

            {hasExpiredGauges && (
              <GridItem colSpan={4}>
                <Alert status="warning">
                  <AlertIcon as={AlertTriangle} />
                  <HStack alignItems="baseline">
                    <AlertTitle>You have votes on an expired pool gauge</AlertTitle>
                    <AlertDescription>Reallocate these to avoid wasting votes</AlertDescription>
                  </HStack>
                </Alert>
              </GridItem>
            )}
          </>
        )}

        <GridItem colSpan={4}>
          {isConnected ? (
            <MyVotesTable loading={myVotesLoading} myVotes={sortedMyVotes} />
          ) : (
            <Center border="1px dashed" borderColor="border.base" h="150px" rounded="lg" w="full">
              <VStack>
                <ConnectWallet size="md" variant="primary" />
              </VStack>
            </Center>
          )}
        </GridItem>
      </Grid>
    </VStack>
  )
}
