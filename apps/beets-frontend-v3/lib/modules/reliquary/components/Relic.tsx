'use client'

import {
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Text,
  Heading,
  CardFooter,
  Button,
} from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { useGetPendingReward } from '../hooks/useGetPendingReward'
import Countdown from 'react-countdown'
import { ReliquaryFarmPosition } from '../reliquary.types'
import { useGetLevelInfo } from '../hooks/useGetLevelInfo'
import { relicGetMaturityProgress } from '../reliquary.helpers'

const RELIC_LEVEL_NAMES = [
  'The Initiate',
  'The Neophyte',
  'The Wanderer',
  'The Rebel',
  'The Skeptic',
  'The Apprentice',
  'The Journeyman',
  'The Savant',
  'The Creator',
  'The Scholar',
  'The Awakened',
]

type RelicProps = {
  chain: GqlChain
  relic: ReliquaryFarmPosition
}

export function Relic({ chain, relic }: RelicProps) {
  const { amount: pendingReward } = useGetPendingReward(chain, relic.relicId)
  const { maturityThresholds } = useGetLevelInfo(chain, relic.relicId)

  const { levelUpDate } = relicGetMaturityProgress(relic, maturityThresholds || [])

  return (
    <Card
      bg="beets.base.800"
      border="1px solid"
      borderColor="beets.base.600"
      minH="400px"
      rounded="xl"
      w="33%"
    >
      <CardHeader>
        <HStack justify="space-between" w="full">
          <Heading size="md">
            Level {relic.level + 1} - {RELIC_LEVEL_NAMES[relic.level]}
          </Heading>
          <Heading size="md">Relic #{relic.relicId}</Heading>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack align="start">
          <HStack justify="space-between" w="full">
            <Text>Amount:</Text>
            <Text>{`${fNum('token', relic.amount)} fBEETS`}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text>Pending rewards:</Text>
            <Text>{`${fNum('token', formatUnits(pendingReward || 0n, 18))} BEETS`}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text>Time to next level:</Text>
            <Text>
              <Countdown date={levelUpDate} />
            </Text>
          </HStack>
        </VStack>
      </CardBody>
      <CardFooter>
        <HStack justify="space-between" w="full">
          <Button>Claim</Button>
          <Button>Level up</Button>
          <Button>Deposit</Button>
          <Button>Withdraw</Button>
        </HStack>
      </CardFooter>
    </Card>
  )
}
