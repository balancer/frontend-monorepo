import {
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'

import { bpsToPercentage } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'

interface Props {
  unallocatedWeight: number
  usePortal?: boolean
}

export function VoteUnallocatedTooltip({ usePortal, unallocatedWeight }: Props) {
  const popoverContent = (
    <PopoverContent bg="background.level3" minWidth={['100px']} p="sm" shadow="3xl">
      <VStack alignItems="start" spacing="sm" width="full">
        <Text color="font.secondary" fontSize="sm" fontWeight={700}>
          {fNum('apr', bpsToPercentage(unallocatedWeight))} votes unallocated
        </Text>
        <Text color="font.secondary" fontSize="sm">
          Since you’re not utilizing all of your votes, you are likely missing out on vote
          incentives.
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
