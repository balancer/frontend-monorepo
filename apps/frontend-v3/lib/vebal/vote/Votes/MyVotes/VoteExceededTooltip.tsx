import { HStack, HoverCard, Portal, Text, VStack } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'
import {
  bpsToPercentage,
  WEIGHT_MAX_VOTES,
} from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'

interface Props {
  exceededWeight: BigNumber
  usePortal?: boolean
}

export function VoteExceededTooltip({ usePortal, exceededWeight }: Props) {
  const popoverContent = (
    <HoverCard.Positioner>
      <HoverCard.Content bg="background.level3" minWidth={['100px']} p="sm" shadow="3xl">
        <VStack alignItems="start" gap="sm" width="full">
          <Text color="font.secondary" fontSize="sm" fontWeight={700}>
            {fNum('apr', bpsToPercentage(exceededWeight))} votes exceeded
          </Text>
          <Text color="font.secondary" fontSize="sm">
            Your votes can’t exceed {WEIGHT_MAX_VOTES}%
          </Text>
        </VStack>
      </HoverCard.Content>
    </HoverCard.Positioner>
  )

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <HStack color="red.400">
          <AlertIcon height="16px" width="16px" />
        </HStack>
      </HoverCard.Trigger>
      {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
    </HoverCard.Root>
  )
}
