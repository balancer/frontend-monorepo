import { Badge, HStack, Text } from '@chakra-ui/react'
import { PoolListItem } from '../pool.types'
import { differenceInHours, isAfter, secondsToMilliseconds } from 'date-fns'
import { now } from '@repo/lib/shared/utils/time'
import { Clock } from 'react-feather'

type Props = {
  pool: PoolListItem
}

export function LbpPoolListInfo({ pool }: Props) {
  const startTime = secondsToMilliseconds(pool.lbpParams?.startTime || 0)
  const endTime = secondsToMilliseconds(pool.lbpParams?.endTime || 0)
  const hasStarted = startTime && isAfter(now(), startTime)
  const hasEnded = endTime && isAfter(now(), endTime)
  const hoursDiff = differenceInHours(endTime, now())

  return hasStarted && !hasEnded ? (
    <HStack gap="xs" textColor="font.warning">
      <Clock size="12" />
      <Text color="font.warning" fontSize="xs">{`${hoursDiff}h`}</Text>
    </HStack>
  ) : hasEnded ? (
    <Badge background="red.400" color="font.dark" fontSize="xs" size="12" userSelect="none">
      Finished
    </Badge>
  ) : (
    ''
  )
}
