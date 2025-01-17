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
  VStack,
} from '@chakra-ui/react'
import { MyVotesTable } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesTable/MyVotesTable'
import { useMyVotes } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { useDisclosure } from '@chakra-ui/hooks'
import { MyVotesHintModal } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesHintModal'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { WEIGHT_VOTE_DELAY } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { oneDayInMs } from '@repo/lib/shared/utils/time'
import { useVotes } from '@repo/lib/modules/vebal/vote/Votes/VotesProvider'
import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
import { AlertTriangle } from 'react-feather'

export function MyVotes() {
  const { hasAllVotingPowerTimeLocked, vebalIsExpired, vebalLockTooShort, shouldResubmitVotes } =
    useVotes()
  const { sortedMyVotes, loading: myVotesLoading, hasExpiredGauges } = useMyVotes()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isConnected } = useUserAccount()

  const { noVeBalBalance } = useVebalUserData()

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
        {hasAllVotingPowerTimeLocked && (
          <GridItem colSpan={4}>
            <Alert status="warning">
              <AlertIcon as={AlertTriangle} />
              <HStack alignItems="baseline">
                <AlertTitle>All your votes are timelocked</AlertTitle>
                <AlertDescription>
                  Once you vote on a pool, your vote is fixed for {WEIGHT_VOTE_DELAY / oneDayInMs}{' '}
                  days.
                </AlertDescription>
              </HStack>
            </Alert>
          </GridItem>
        )}
        {/* fix: (votes) need design */}
        {vebalLockTooShort && (
          <GridItem colSpan={4}>
            <Alert status="warning">
              <AlertIcon as={AlertTriangle} />
              <HStack alignItems="baseline">
                <AlertTitle>veBAL not locked for 7 days</AlertTitle>
                <AlertDescription>
                  You must have veBAL locked for more than 7 days to vote on gauges.
                </AlertDescription>
              </HStack>
            </Alert>
          </GridItem>
        )}
        {/* fix: (votes) need design */}
        {shouldResubmitVotes && (
          <GridItem colSpan={4}>
            <Alert status="warning">
              <AlertIcon as={AlertTriangle} />
              <HStack alignItems="baseline">
                <AlertTitle>Resubmit your votes to utilize your full voting power</AlertTitle>
                <AlertDescription>
                  Votes on pools are set at the time of the vote. Since you’ve added new veBAL since
                  your original vote, you have additional voting power which is not being used. Use{' '}
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  the 'Submit votes' button to resubmit your votes.
                </AlertDescription>
              </HStack>
            </Alert>
          </GridItem>
        )}
        {/* fix: (votes) need design */}
        {vebalIsExpired && (
          <GridItem colSpan={4}>
            <Alert status="warning">
              <AlertIcon as={AlertTriangle} />
              <HStack alignItems="baseline">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <AlertTitle>You can't vote because your veBAL has expired</AlertTitle>
                <AlertDescription>
                  You need some veBAL to vote on gauges. Unlock and relock your B-80BAL-20-WETH to
                  get some veBAL.
                </AlertDescription>
              </HStack>
            </Alert>
          </GridItem>
        )}
        {/* fix: (votes) need design */}
        {noVeBalBalance && (
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
        <GridItem colSpan={4}>
          {isConnected ? (
            <MyVotesTable loading={myVotesLoading} myVotes={sortedMyVotes} />
          ) : (
            <Center border="1px dashed" borderColor="border.base" h="150px" rounded="lg" w="full">
              <ConnectWallet size="md" variant="primary" />
            </Center>
          )}
        </GridItem>
      </Grid>
    </VStack>
  )
}
