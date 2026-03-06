import { HStack, HoverCard, Portal, Text, VStack } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'

import { bpsToPercentage } from '@bal/lib/vebal/vote/Votes/MyVotes/myVotes.helpers'

interface Props {
  unallocatedWeight: BigNumber
  usePortal?: boolean
}

export function VoteUnallocatedTooltip({ usePortal, unallocatedWeight }: Props) {
  const popoverContent = (
    <HoverCard.Positioner>
      <HoverCard.Content bg="background.level3" minWidth={['100px']} p="sm" shadow="3xl">
        <VStack alignItems="start" gap="sm" width="full">
          <Text color="font.secondary" fontSize="sm" fontWeight={700}>
            {fNum('apr', bpsToPercentage(unallocatedWeight))} votes unallocated
          </Text>
          <Text color="font.secondary" fontSize="sm">
            Since you’re not utilizing all of your votes, you are likely missing out on vote
            incentives.
          </Text>
        </VStack>
      </HoverCard.Content>
    </HoverCard.Positioner>
  )

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <HStack color="font.warning">
          <AlertIcon height="16px" width="16px" />
        </HStack>
      </HoverCard.Trigger>
      {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
    </HoverCard.Root>
  )
}
