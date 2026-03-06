import { HoverCard, Box, Text } from '@chakra-ui/react'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'

interface InfoIconPopoverProps {
  message: string
  placement?: string
}

export function InfoIconPopover({ message, placement = 'top-start' }: InfoIconPopoverProps) {
  return (
    <HoverCard.Root
      positioning={{
        placement: placement,
      }}
    >
      <HoverCard.Trigger asChild>
        <Box
          _hover={{ opacity: 1 }}
          cursor="pointer"
          opacity="0.5"
          transition="opacity 0.2s var(--ease-out-cubic)"
        >
          <InfoIcon />
        </Box>
      </HoverCard.Trigger>
      <HoverCard.Positioner>
        <HoverCard.Content maxW="300px" p="sm" w="auto">
          <Text fontSize="sm" variant="secondary">
            {message}
          </Text>
        </HoverCard.Content>
      </HoverCard.Positioner>
    </HoverCard.Root>
  )
}
