import { Button, Card, HStack, VStack, Text, Box } from '@chakra-ui/react'
import { useCurrentDate } from '@repo/lib/shared/hooks/date.hooks'
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  nextThursday,
} from 'date-fns'
import { oneSecondInMs } from '@repo/lib/shared/utils/time'

export function VotingDeadlineCounter() {
  const now = useCurrentDate(oneSecondInMs)
  const deadlineDate = nextThursday(now) // fixme: calculate exact time

  const counters = [
    {
      title: 'D',
      value: differenceInDays(deadlineDate, now),
    },
    {
      title: 'H',
      value: differenceInHours(deadlineDate, now) % 24,
    },
    {
      title: 'M',
      value: differenceInMinutes(deadlineDate, now) % (24 * 60),
    },
    {
      title: 'S',
      value: differenceInSeconds(deadlineDate, now) % (24 * 60 * 60),
    },
  ]

  return (
    <Card>
      <VStack>
        <HStack justifyContent="space-between">
          <Text variant="secondary">{format(deadlineDate, 'EEEE, HHa')} EST</Text>
          <Button>Set reminder</Button>
        </HStack>
        <HStack>
          {counters.map(counter => (
            <Box key={counter.title} flex="1">
              <VStack>
                <Text variant="secondary">{counter.title}</Text>
                <Text>{String(counter.value).padStart(2, '0')}</Text>
              </VStack>
            </Box>
          ))}
        </HStack>
      </VStack>
    </Card>
  )
}
