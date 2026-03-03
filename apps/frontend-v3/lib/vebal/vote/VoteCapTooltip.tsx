import { HStack, Text, Popover, HoverCard, Portal, VStack } from '@chakra-ui/react';
import { VoteCapIcon } from '@repo/lib/shared/components/icons/VoteCapIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { VotesState } from '@repo/lib/modules/vebal/vote/vote.types'

interface Props {
  relativeWeightCap: number
  votesState?: VotesState
  usePortal?: boolean
}

export function VoteCapTooltip({ relativeWeightCap, votesState, usePortal = true }: Props) {
  const votesColor =
    votesState === 'normal' ? undefined : votesState === 'close' ? 'font.warning' : 'red.400'

  const voteCapText =
    votesState === 'normal'
      ? 'vote cap'
      : votesState === 'close'
        ? 'vote cap is close'
        : 'vote cap exceeded'

  const popoverContent = (
    <HoverCard.Positioner>
      <HoverCard.Content bg="background.level3" minWidth={['100px', '170px']} p="sm" shadow="3xl">
        <VStack alignItems="start" gap="sm" width="full">
          <Text color={votesColor ?? 'font.secondary'} fontSize="sm" fontWeight={700}>
            {fNum('apr', relativeWeightCap)} {voteCapText}
          </Text>
          <Text color="font.secondary" fontSize="sm">
            Governance by veBAL holders have set a cap on this gauge. Any votes that push the vote
            above this cap will be disregarded.
          </Text>
        </VStack>
      </HoverCard.Content>
    </HoverCard.Positioner>
  )
  return (
    <HoverCard.Root>
      <>
        <HoverCard.Trigger asChild>
          <HStack color={votesColor ?? 'font.secondary'}>
            <VoteCapIcon height="16px" width="16px" />
          </HStack>
        </HoverCard.Trigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </HoverCard.Root>
  );
}
