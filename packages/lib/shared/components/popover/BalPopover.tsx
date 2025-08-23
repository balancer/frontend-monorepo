import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  PlacementWithLogical,
} from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

type BalPopoverProps = {
  text: string
  placement?: PlacementWithLogical
}

export function BalPopover({
  children,
  text,
  placement = 'right',
}: PropsWithChildren<BalPopoverProps>) {
  return (
    <Popover placement={placement} trigger="hover">
      <PopoverTrigger>{children}</PopoverTrigger>

      <PopoverContent maxW="300px" p="sm" w="auto">
        <Text fontSize="sm" variant="secondary">
          {text}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
