import { Popover, HoverCard, Text } from '@chakra-ui/react';
import { PropsWithChildren } from 'react'

type BalPopoverProps = {
  text: string
  placement?: string
}

export function BalPopover({
  children,
  text,
  placement = 'right' }: PropsWithChildren<BalPopoverProps>) {
  return (
    <HoverCard.Root
      positioning={{
        placement: placement
      }}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Positioner>
        <HoverCard.Content maxW="300px" p="sm" w="auto">
          <Text fontSize="sm" variant="secondary">
            {text}
          </Text>
        </HoverCard.Content>
      </HoverCard.Positioner>
    </HoverCard.Root>
  );
}
