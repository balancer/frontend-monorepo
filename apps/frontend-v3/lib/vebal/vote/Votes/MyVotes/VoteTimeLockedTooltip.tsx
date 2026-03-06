import { HStack, HoverCard, Portal, Text, VStack } from '@chakra-ui/react'
import { WEIGHT_VOTE_DELAY } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'
import { TimeLockIcon } from '@repo/lib/shared/components/icons/TimeLockIcon'
import { oneDayInMs } from '@repo/lib/shared/utils/time'
import { PRETTY_DATE_FORMAT } from '@bal/lib/vebal/lock/duration/lock-duration.constants'
import { format } from 'date-fns'

interface Props {
  timeLockedEndDate?: Date
  usePortal?: boolean
}

export function VoteTimeLockedTooltip({ timeLockedEndDate, usePortal }: Props) {
  const popoverContent = (
    <HoverCard.Positioner>
      <HoverCard.Content bg="background.level3" minWidth={['100px']} p="sm" shadow="3xl">
        <VStack alignItems="start" gap="sm" width="full">
          <Text color="font.secondary" fontSize="sm" fontWeight={700}>
            Your vote is timelocked
          </Text>
          <Text color="font.secondary" fontSize="sm">
            Once you vote on a pool, your vote is fixed for {WEIGHT_VOTE_DELAY / oneDayInMs} days.{' '}
            {timeLockedEndDate &&
              `No edits can be made until ${format(timeLockedEndDate, PRETTY_DATE_FORMAT)}`}
          </Text>
        </VStack>
      </HoverCard.Content>
    </HoverCard.Positioner>
  )

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <HStack color="orange.300">
          <TimeLockIcon height="16px" width="16px" />
        </HStack>
      </HoverCard.Trigger>
      {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
    </HoverCard.Root>
  )
}
