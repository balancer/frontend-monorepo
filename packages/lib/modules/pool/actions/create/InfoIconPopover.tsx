import {
  Popover,
  PopoverTrigger,
  Box,
  PopoverContent,
  Text,
  PlacementWithLogical,
} from '@chakra-ui/react'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'

interface InfoIconPopoverProps {
  message: string
  placement?: PlacementWithLogical
}

export function InfoIconPopover({ message, placement = 'top-start' }: InfoIconPopoverProps) {
  return (
    <Popover placement={placement} trigger="hover">
      <PopoverTrigger>
        <Box
          _hover={{ opacity: 1 }}
          cursor="pointer"
          opacity="0.5"
          transition="opacity 0.2s var(--ease-out-cubic)"
        >
          <InfoIcon />
        </Box>
      </PopoverTrigger>
      <PopoverContent maxW="300px" p="sm" w="auto">
        <Text fontSize="sm" variant="secondary">
          {message}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
