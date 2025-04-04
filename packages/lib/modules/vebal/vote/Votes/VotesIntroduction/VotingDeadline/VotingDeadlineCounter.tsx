import { HStack, VStack, Text, Box } from '@chakra-ui/react'
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
import { VotingDeadlineContainer } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/VotingDeadlineContainer'
import { ReminderButton } from '@repo/lib/modules/vebal/vote/Votes/VotesIntroduction/VotingDeadline/ReminderButton'

const countdownItemBoxShadowStyles = [
  '0px 0px 0px 1px #00000005',
  '1px 1px 1px -0.5px #0000000F',
  '3px 3px 3px -1.5px #0000000F',
  '6px 6px 6px -3px #0000001A',
  '-0.5px -1px 0px 0px #FFFFFF26',
].join(', ')

export function VotingDeadlineCounter() {
  const now = useCurrentDate(oneSecondInMs)
  const nowWithoutTime = new Date().setUTCHours(0, 0, 0, 0)
  const deadline = nextThursday(nowWithoutTime)

  const daysDiff = differenceInDays(deadline, now)
  const hoursDiff = differenceInHours(deadline, now) - daysDiff * 24
  const minutesDiff = differenceInMinutes(deadline, now) - differenceInHours(deadline, now) * 60
  const secondsDiff = differenceInSeconds(deadline, now) - differenceInMinutes(deadline, now) * 60

  const counters = [
    { title: 'D', value: daysDiff },
    { title: 'H', value: hoursDiff },
    { title: 'M', value: minutesDiff },
    { title: 'S', value: secondsDiff },
  ]

  return (
    <VotingDeadlineContainer>
      <VStack spacing="md">
        <HStack justify="space-between" w="full">
          <Text alignSelf="start" color="font.secondary" fontSize="14px" lineHeight="20px">
            {format(deadline, 'EEEE, Haaa zzzz')}
          </Text>
          <ReminderButton>Set reminder</ReminderButton>
        </HStack>
        <HStack spacing="sm" w="full">
          {counters.map(counter => (
            <Box flex="1" key={counter.title}>
              <VStack
                bg="background.level3"
                boxShadow={countdownItemBoxShadowStyles}
                px="14px"
                py="13px"
                rounded="lg"
                spacing="sm"
              >
                <Text color="font.secondary" fontSize="16px" fontWeight={500} lineHeight="20px">
                  {counter.title}
                </Text>
                <Text
                  fontSize={{ base: '24px', lg: '32px' }}
                  fontWeight={500}
                  lineHeight="40px"
                  textAlign="center"
                  w={{ base: '34px', lg: '56px' }}
                >
                  {String(counter.value).padStart(2, '0')}
                </Text>
              </VStack>
            </Box>
          ))}
        </HStack>
      </VStack>
    </VotingDeadlineContainer>
  )
}
