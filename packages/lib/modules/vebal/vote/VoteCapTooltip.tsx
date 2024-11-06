import {
  HStack,
  Text,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  VStack,
} from '@chakra-ui/react'
import { VoteListItem } from '@repo/lib/modules/vebal/vote/vote.types'
import { VoteCapIcon } from '@repo/lib/shared/components/icons/VoteCapIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'

interface Props {
  vote: VoteListItem
  usePortal?: boolean
}

export function VoteCapTooltip({ vote, usePortal = true }: Props) {
  const relativeWeightCap = vote.gauge.relativeWeightCap ? Number(vote.gauge.relativeWeightCap) : 0

  const popoverContent = (
    <PopoverContent bg="background.level3" minWidth={['100px', '170px']} p="sm" shadow="3xl">
      <VStack alignItems="start" spacing="sm" width="full">
        <Text color="font.secondary" fontWeight={700} fontSize="sm">
          {fNum('apr', relativeWeightCap)} vote cap
        </Text>
        <Text color="font.secondary" fontSize="sm">
          Governance by veBAL holders have set a cap on this gauge. Any votes that push the vote
          above this cap will be disregarded.
        </Text>
      </VStack>
    </PopoverContent>
  )
  return (
    <Popover trigger="hover">
      <>
        <PopoverTrigger>
          <HStack color="font.secondary">
            <VoteCapIcon width="16px" height="16px" />
          </HStack>
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
