'use client'

import {
  Alert,
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
  const { hasAllVotingPowerTimeLocked, vebalIsExpired, vebalLockTooShort } = useVotes()
  const {
    sortedMyVotes,
    loading: myVotesLoading,
    hasExpiredGauges,
    hasNewVotes,
    hasUsablePools,
  } = useMyVotes()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isConnected } = useUserAccount()

  const { isLoading: vebalUserDataLoading, veBALBalance, noVeBALBalance } = useVebalUserData()

  const loading = myVotesLoading || vebalUserDataLoading

  return (
    <VStack align="start" spacing="md" w="full">
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
                </Stack>
              </Alert>
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
                  <GridItem colSpan={4} w="full">
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

                {hasExpiredGauges && (
                  <GridItem colSpan={4} w="full">
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

                {hasNewVotes && hasUsablePools && (
                  <GridItem colSpan={4} w="full">
                    <Alert status="warning">
                      <AlertIcon as={AlertTriangle} />
                      <Stack alignItems="baseline" gap="0">
                        <AlertTitle>Resubmit your votes to use your full voting power</AlertTitle>
                        <AlertDescription fontSize="sm">
                          Votes are set at the time you cast them. Since you've added more veBAL
                          afterward, that extra voting power is not being fully utilized.
                        </AlertDescription>
                      </Stack>
                    </Alert>
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
  )
}
