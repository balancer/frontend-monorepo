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
import {
  bpsToPercentage,
  WEIGHT_MAX_VOTES,
} from '@repo/lib/modules/vebal/vote/Votes/MyVotes/myVotes.helpers'

interface Props {
  exceededWeight: number
  usePortal?: boolean
}

export function VoteExceededTooltip({ usePortal, exceededWeight }: Props) {
  const popoverContent = (
    <PopoverContent bg="background.level3" minWidth={['100px']} p="sm" shadow="3xl">
      <VStack alignItems="start" spacing="sm" width="full">
        <Text color="font.secondary" fontSize="sm" fontWeight={700}>
          {fNum('apr', bpsToPercentage(exceededWeight))} votes exceeded
        </Text>
        <Text color="font.secondary" fontSize="sm">
          Your votes can’t exceed {WEIGHT_MAX_VOTES}%
        </Text>
      </VStack>
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      <>
        <PopoverTrigger>
          <HStack color="red.400">
            <AlertIcon height="16px" width="16px" />
          </HStack>
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
