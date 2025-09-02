import {
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'

type Props = {
  usePortal?: boolean
  isTimelocked: boolean
}

export function VoteUnderpoweredTooltip({ usePortal, isTimelocked }: Props) {
  const title = isTimelocked
    ? 'Resubmit your votes to utilize your full voting power once your timelock is over'
    : 'Resubmit your votes to utilize your full voting power'

  const popoverContent = (
    <PopoverContent bg="background.level3" minWidth={['100px']} p="sm" shadow="3xl">
      <VStack alignItems="start" spacing="sm" width="full">
        <Text color="font.secondary" fontSize="sm" fontWeight={700}>
          {title}
        </Text>
        <Text color="font.secondary" fontSize="sm">
          Your pool gauge was set at the time of your last vote and decays linearly until your veBAL
          expiry. You have acquired new veBAL since your last vote. Re-vote to update the gauge with
          your full veBAL voting power.
        </Text>
      </VStack>
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      <>
        <PopoverTrigger>
          <HStack color="font.warning">
            <AlertIcon height="16px" width="16px" />
          </HStack>
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
